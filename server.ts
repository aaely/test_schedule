const bodyParser = require('body-parser');
const http = require("http");
const { send } = require('process');
const cookieSession = require('cookie-session');
const neo4j = require('neo4j-driver');
const cors = require('cors')
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SEDGRID_API_KEY)
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// ****************************
//   Neo4j connection driver
// ****************************

let driver

const target = "trucks";

(async() => { 

  try {
    driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'Asdf123$'), { database: 'trucks' });
    const ServerInfo = await driver.getServerInfo()
    console.log(ServerInfo)
    console.log('connected')
  } catch (error) {
    console.log(`Connection error\n${error}\nCause: ${error.cause}`)
  }
})()

// ***************************
// Express endpoint services
// ***************************

const express = require('express')
console.log(process.env.DB)
const app = express()
app.use(cors())
app.use(bodyParser.json());

app.listen(5555, () => {
  console.log('server is listening on :5555')
})

const JWT_SECRET = 'tO7E8uCjD5rXpQl0FhKwV2yMz4bJnAi9sGeR3kTzXvNmPuLsDq8W';


//***************************
// Middleware to Verify Token
//***************************


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.sendStatus(401);

  const token = authHeader.split(' ')[1]
  if (!token) return res.sendStatus(401)

  jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
  });
};


/*******************************
  Middleware to authorize roles
********************************/


const authorizeRoles = (requiredRoles) => {
  return (req, res, next) => {
      const { roles } = req.user;
      if (requiredRoles.some(role => roles.includes(role))) {
          next();
      } else {
          res.sendStatus(403);
      }
  };
};


// Registration Route
app.post('/register', async (req, res) => {

    const session = driver.session({
      database: target,
    })

    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await session.run(
            `CREATE (u:User {name: $username, password: $password, role: 'read'})`,
            { username, password: hashedPassword }
        );

        res.status(201).send('User registered');
    } catch (error) {
        console.log(error)
        res.status(500).send('Error registering user');
    } finally {
      session.close()
    }
});

// Login Route
app.post('/login', async (req, res) => {

    const session = driver.session({
      database: target,
    })
    const { username, password } = req.body;

    const result = await session.run(
        'MATCH (u:User {name: $username}) RETURN u',
        { username }
    );

    if (result.records.length === 0) {
        return res.status(400).send('User not found');
    }

    const user = result.records[0].get('u').properties;
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(400).send('Invalid password');
    }

    const token = jwt.sign({ username: user.username, roles: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).send({ token, user });

    await session.close()
});

app.post('/api/trailers', async (req, res) => {
  const session = driver.session({
    database: target,
  })
  try {
    const result = await session.run(`
    MATCH (trailer:Trailer)-[:HAS_SCHEDULE]->(s:Schedule {ScheduleDate: '${req.body.date}'})
    MATCH (trailer)-[:HAS_SID]->(sid:SID)-[:HAS_PART]->(part:Part)
    RETURN trailer.id AS TrailerID, COLLECT({sid: sid.id, cisco: sid.ciscoID, partNumber: part.number, quantity: part.quantity}) AS SidsAndParts
    `);
    const data = result.records.map(record => ({
      TrailerID: record.get('TrailerID'),
      Sids: record.get('SidsAndParts').map(sp => ({
        sid: sp.sid,
        cisco: sp.cisco,
        partNumber: sp.partNumber,
        quantity: sp.quantity
      }))
    }));
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
    console.log(session)
  } finally {
    try {
      await session.close();
    } catch(error) {
      console.log(error)
    }
  }
});

app.post('/api/expedite', async (req, res) => {
  const session = driver.session({ database: target });
  try {
    const result = await session.run(`
      MATCH (counter:ExpediteCounter)
      SET counter.count = counter.count + 1
      WITH counter.count AS newCount
      CREATE (trailer:Trailer {id: 'EXPEDITE' + newCount})
      CREATE (schedule:Schedule {
          RequestDate: '${req.body.Date}',
          ScheduleDate: '${req.body.Date}',
          ScheduleTime: '${req.body.ArrivalTime}',
          CarrierCode: '',
          PlantCode: '',
          ArrivalTime: '${req.body.ArrivalTime}',
          DoorNumber: '2',
          Email: '',
          LoadStatus: 'unloaded',
          IsHot: false
      })
      CREATE (trailer)-[:HAS_SCHEDULE]->(schedule)
      RETURN trailer.id AS TrailerID, schedule
    `);
    const TrailerID = result.records[0].get('TrailerID');
    const Schedule = result.records[0].get('schedule').properties;
    res.json({ TrailerID, Schedule });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    try {
      await session.close();
    } catch(error) {
      console.log(error)
    }
  }
});

app.get('/api/schedule_trailer', async (req, res) => {
  const session = driver.session({
    database: target,
  })
  try {
    const result = await session.run(`
    MATCH (trailer:Trailer)-[:HAS_SCHEDULE]->(s:Schedule)
    WITH trailer, s
    MATCH (trailer)-[:HAS_CISCO]->(cisco:Cisco)
    RETURN trailer.id AS TrailerID, s, COLLECT(cisco.id) AS CiscoIDs`
  );
    const data = result.records.map(record => ({
      TrailerID: record.get('TrailerID'),
      Schedule: record.get('s').properties,
      CiscoIDs: record.get('CiscoIDs'),
    }));
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
    console.log(session)
  } finally {
    try {
      await session.close();
    } catch(error) {
      console.log(error)
    }
  }
});

app.post('/api/hot_trailer', async (req, res) => {
  const session = driver.session({
    database: target,
  })
  try {
    const result = await session.run(`
    MATCH (trailer:Trailer)-[:HAS_SCHEDULE]->(s:Schedule)
    WHERE trailer.id = "${req.body.param}"
    SET s.IsHot = NOT s.IsHot  
    RETURN trailer, s
    `);
    const data = result.records.map(record => ({
      TrailerID: record.get('trailer'),
      Schedule: record.get('s')
    }))
    res.send(data)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    try {
      await session.close();
    } catch(error) {
      console.log(error)
    }
  }
});

app.post(
  '/api/set_door', 
  authenticateToken,
  authorizeRoles(['write']),
  async (req, res) => {
  const session = driver.session({
    database: target,
  })
  try {
    const result = await session.run(`
    MATCH (trailer:Trailer)-[:HAS_SCHEDULE]->(s:Schedule)
    WHERE trailer.id = "${req.body.TrailerID}"
    SET s.DoorNumber = "${req.body.Door}"
    RETURN trailer, s`
  );
  const data = result.records.map(record => ({
    TrailerID: record.get('trailer'),
    Schedule: record.get('s')
  }))
  res.send(data)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    try {
      await session.close();
    } catch(error) {
      console.log(error)
    }
  }
});

app.post(
  '/api/set_arrivalTime',
  authenticateToken,
  authorizeRoles(['write']),
  async (req, res) => {
  const session = driver.session({
    database: target,
  })
  try {
    const result = await session.run(`
    MATCH (trailer:Trailer)-[:HAS_SCHEDULE]->(s:Schedule)
    WHERE trailer.id = "${req.body.params.TrailerID}"
    SET s.ArrivalTime = "${req.body.params.ArrivalTime}"
    RETURN trailer, s`
    );
    const data = result.records.map(record => ({
      TrailerID: record.get('trailer'),
      Schedule: record.get('s')
    }))
    res.send(data)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await session.close();
  }
});

app.post(
  '/api/set_schedule', 
  authenticateToken, 
  authorizeRoles(['write']), 
  async (req, res) => {
    const session = driver.session({
      database: target,
    })
    try {
      const result = await session.run(`
      MATCH (trailer:Trailer)-[:HAS_SCHEDULE]->(s:Schedule)
      WHERE trailer.id = "${req.body.TrailerID}"
      SET s.ScheduleDate = "${req.body.ScheduledDate}"
      SET s.RequestDate = "${req.body.RequestDate}"
      SET s.CarrierCode = "${req.body.CarrierCode}"
      SET s.ScheduleTime = "${req.body.ScheduleTime}"
      SET s.LastFreeDate = "${req.body.LastFreeDate}"
      SET s.ContactEmail = "${req.body.ContactEmail}"
      RETURN trailer, s
      `);
    const data = result.records.map(record => ({
      TrailerID: record.get('trailer'),
      Schedule: record.get('s')
    }))
    console.log(data)
    res.send(data)
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      try {
        await session.close();
      } catch(error) {
        console.log(error)
      }
    }
  });

app.post('/api/get_cisco', async (req, res) => {
  const session = driver.session({
    database: target,
  })
  try {
    const result = await session.run(`
    MATCH (trailer:Trailer {id: '${req.body.param}'})-[:HAS_CISCO]->(cisco:Cisco)
    RETURN COLLECT(cisco.id) AS CiscoIDs
    `)
    const data = result.records.map(record => record.get('CiscoIDs'));
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    try {
      await session.close();
    } catch(error) {
      console.log(error)
    }
  }
})

app.post('/api/get_load_info', async (req, res) => {
  const session = driver.session({
    database: target,
  })
  try {
    const result = await session.run(`
    MATCH (trailer:Trailer {id: '${req.body.param}'})-[:HAS_SID]->(sid:SID)-[:HAS_PART]->(part:Part)
    RETURN sid, COLLECT({partNumber: part.number, quantity: part.quantity}) AS parts
    `)
    const data = result.records.map(record => ({
      Sids: record.get('sid').properties,
      Parts: record.get('parts')
    }));
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    try {
      await session.close();
    } catch(error) {
      console.log(error)
    }
  }
})

app.post('/api/send_email', async (req, res) => {
  try {
    await sgMail.send(req.body.msg)
    console.log('email sent')
  } catch(error) {
    console.log(error)
  }
  
})

app.post('/api/todays_trucks', async (req, res) => {
  const session = driver.session({
    database: target,
  })
  try {
    const result = await session.run(`
    MATCH (trailer:Trailer)-[:HAS_SCHEDULE]->(s:Schedule)
    WHERE s.ScheduleDate = '${req.body.date}'
    WITH trailer, s
    MATCH (trailer)-[:HAS_CISCO]->(cisco:Cisco)
    RETURN trailer.id AS TrailerID, s, COLLECT(cisco.id) AS CiscoIDs
    `);
    const data = result.records.map(record => ({
      TrailerID: record.get('TrailerID'),
      Schedule: record.get('s').properties,
      CiscoIDs: record.get('CiscoIDs')
    }));
    res.send(data)
  } catch(error) {
    console.log(error)
  } finally {
    try {
      await session.close();
    } catch(error) {
      console.log(error)
    }
  }
}) 

app.post('/api/trucks_date_range', async (req, res) => {
  const session = driver.session({
    database: target,
  })
  try {
    const result = await session.run(`
    MATCH (trailer:Trailer)-[:HAS_SCHEDULE]->(s:Schedule)
    WHERE s.ScheduleDate >= '${req.body.startDate}' and s.ScheduleDate <= '${req.body.endDate}'
    WITH trailer, s
    MATCH (trailer)-[:HAS_CISCO]->(cisco:Cisco)
    RETURN trailer.id AS TrailerID, s, COLLECT(cisco.id) AS CiscoIDs
    `);
    const data = result.records.map(record => ({
      TrailerID: record.get('TrailerID'),
      Schedule: record.get('s').properties,
      CiscoIDs: record.get('CiscoIDs')
    }));
    res.send(data)
  } catch(error) {
    console.log(error)
  } finally {
    try {
      await session.close();
    } catch(error) {
      console.log(error)
    }
  }
}) 



// **********************
// SocketIO Services
// **********************

const socket = require('socket.io')
const PORT = 3030;
const server = app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`)
})

const io = socket(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    },
})

/*const session = driver.session({
  database: 'trucks',
})*/

io.on('connection', socket => {
    socket.emit('connection', null)
    console.log(socket.id)

    socket.on('hot-trailer', async (data) => {
      try {

      } catch(error) {
        console.error(error.message)
        socket.emit('')
      }
      const { trailer } = data

      io.emit('broadcast', {
        event: 'HOT_TRAILER',
        trailer: data.trailer
      })
    })

    socket.on('trailer-arrived', data => {
      console.log(data)
      io.emit('broadcast', {
        event: 'TRAILER_ARRIVED',
        trailer: data.trailer,
        time: data.time
      })
    })

    socket.on('door-assigned', data => {
      console.log(data)
      io.emit('broadcast', {
        event: 'ASSIGN_DOOR',
        trailer: data.trailer,
        door: data.door
      })
    })

    socket.on('trailer-scheduled', data => {
      console.log(data)
      io.emit('broadcast', {
        event: 'TRAILER_SCHEDULED',
        trailer: data.trailer,
        lfd: data.lfd,
        scd: data.scd,
        sct: data.sct,
        scac: data.scac,
        rqd: data.rqd
      })
    })
})
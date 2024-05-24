const bodyParser = require('body-parser');
const http = require("http");
const { send } = require('process');
const cookieSession = require('cookie-session');
const neo4j = require('neo4j-driver');
const cors = require('cors')
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey('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')

// ****************************
//   Neo4j connection driver
// ****************************

let driver

(async() => { 

  try {
    driver = neo4j.driver('neo4j://localhost:7687', neo4j.auth.basic('neo4j', 'Asdf123$'), { database: 'trucks' });
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

const app = express()
app.use(cors())
app.use(bodyParser.json());

app.listen(5555, () => {
  console.log('server is listening on :5555')
})

app.get('/api/trailers', async (req, res) => {
  const session = driver.session({
    database: 'trucks',
  })
  try {
    const result = await session.run(`
    MATCH (trailer:Trailer)-[:HAS_SID]->(sid:SID)-[:HAS_PART]->(part:Part)
    RETURN trailer.id AS TrailerID, COLLECT({sid: sid.id, cisco: sid.ciscoID,
    partNumber: part.number, quantity: part.quantity}) AS SidsAndParts`);
    console.log(result.records)
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
    await session.close();
  }
});

app.get('/api/schedule_trailer', async (req, res) => {
  const session = driver.session({
    database: 'trucks',
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
    await session.close();
  }
});

app.post('/api/hot_trailer', async (req, res) => {
  const session = driver.session({
    database: 'trucks',
  })
  try {
    const result = await session.run(`MATCH (trailer:Trailer)-[:HAS_SCHEDULE]->(s:Schedule)
    WHERE trailer.id = "${req.body.param}"
    SET s.IsHot = NOT s.IsHot  
    RETURN trailer, s`
  );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await session.close();
  }
});

app.post('/api/set_door', async (req, res) => {
  const session = driver.session({
    database: 'trucks',
  })
  try {
    const result = await session.run(`MATCH (trailer:Trailer)-[:HAS_SCHEDULE]->(s:Schedule)
    WHERE trailer.id = "${req.body.TrailerID}"
    SET s.DoorNumber = "${req.body.Door}"
    RETURN trailer, s`
  );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await session.close();
  }
});

app.post('/api/set_arrivalTime', async (req, res) => {
  const session = driver.session({
    database: 'trucks',
  })
  try {
    const result = await session.run(`MATCH (trailer:Trailer)-[:HAS_SCHEDULE]->(s:Schedule)
    WHERE trailer.id = "${req.body.params.TrailerID}"
    SET s.ArrivalTime = "${req.body.params.ArrivalTime}"
    RETURN trailer, s`
  );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await session.close();
  }
});

app.post('/api/set_schedule', async (req, res) => {
  const session = driver.session({
    database: 'trucks',
  })
  try {
    const result = await session.run(`MATCH (trailer:Trailer)-[:HAS_SCHEDULE]->(s:Schedule)
    WHERE trailer.id = "${req.body.TrailerID}"
    SET s.ScheduleDate = "${req.body.ScheduledDate}"
    SET s.RequestDate = "${req.body.RequestDate}"
    SET s.CarrierCode = "${req.body.CarrierCode}"
    SET s.ScheduleTime = "${req.body.ScheduleTime}"
    SET s.LastFreeDate = "${req.body.LastFreeDate}"
    RETURN trailer, s`
  );
  console.log(result.records.map(record=> ({
    Schedule: record.get('s').properties
  })))
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await session.close();
  }
});

app.post('/api/get_cisco', async (req, res) => {
  const session = driver.session({
    database: 'trucks',
  })
  try {
    const result = await session.run(`MATCH (trailer:Trailer {id: '${req.body.param}'})-[:HAS_CISCO]->(cisco:Cisco)
    RETURN COLLECT(cisco.id) AS CiscoIDs`)
    const data = result.records.map(record => record.get('CiscoIDs'));
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await session.close();
  }
})

app.post('/api/get_load_info', async (req, res) => {
  const session = driver.session({
    database: 'trucks',
  })
  try {
    const result = await session.run(`MATCH (trailer:Trailer {id: '${req.body.param}'})-[:HAS_SID]->(sid:SID)-[:HAS_PART]->(part:Part)
    RETURN sid, COLLECT({partNumber: part.number, quantity: part.quantity}) AS parts`)
    const data = result.records.map(record => ({
      Sids: record.get('sid').properties,
      Parts: record.get('parts')
    }));
    console.log(data)
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await session.close();
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
    database: 'trucks',
  })
  try {
    console.log(req.body)
    const result = await session.run(`
    MATCH (trailer:Trailer)-[:HAS_SCHEDULE]->(s:Schedule)
    WHERE s.ScheduleDate = '${req.body.date}'
    WITH trailer, s
    MATCH (trailer)-[:HAS_CISCO]->(cisco:Cisco)
    RETURN trailer.id AS TrailerID, s, COLLECT(cisco.id) AS CiscoIDs`
  );
    const data = result.records.map(record => ({
      TrailerID: record.get('TrailerID'),
      Schedule: record.get('s').properties,
      CiscoIDs: record.get('CiscoIDs')
    }));
    res.send(data)
  } catch(error) {
    console.log(error)
  }
}) 

app.post('/api/trucks_date_range', async (req, res) => {
  const session = driver.session({
    database: 'trucks',
  })
  try {
    console.log(req.body)
    const result = await session.run(`
    MATCH (trailer:Trailer)-[:HAS_SCHEDULE]->(s:Schedule)
    WHERE s.ScheduleDate >= '${req.body.startDate}' and s.ScheduleDate <= '${req.body.endDate}'
    WITH trailer, s
    MATCH (trailer)-[:HAS_CISCO]->(cisco:Cisco)
    RETURN trailer.id AS TrailerID, s, COLLECT(cisco.id) AS CiscoIDs`
  );
    const data = result.records.map(record => ({
      TrailerID: record.get('TrailerID'),
      Schedule: record.get('s').properties,
      CiscoIDs: record.get('CiscoIDs')
    }));
    res.send(data)
  } catch(error) {
    console.log(error)
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


io.on('connection', socket => {
    socket.emit('connection', null)
    console.log(socket.id)

    socket.on('hot-trailer', data => {
      socket.broadcast.emit('broadcast', {
        event: 'HOT_TRAILER',
        trailer: data.trailer
      })
    })

    socket.on('trailer-arrived', data => {
      console.log(data)
      socket.broadcast.emit('broadcast', {
        event: 'TRAILER_ARRIVED',
        trailer: data.trailer,
        time: data.time
      })
    })

    socket.on('trailer-scheduled', data => {
      console.log(data)
      socket.broadcast.emit('broadcast', {
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
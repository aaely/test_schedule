import socketio from 'socket.io-client';
import { setRecoil, getRecoil } from 'recoil-nexus';
import { trucks } from './Recoil/trucks';
import { lastFreeDate } from './Recoil/forms';


const URL = 'http://192.168.4.70:3030';

let socket: any

export const connectWithWebSocket = () => {
    socket = socketio(URL)
    socket.on('connection', () => {
        console.log("connected!")
    })
    socket.on('broadcast', (data: any) => {
        console.log(data)
        switch (data.event) {
            case 'HOT_TRAILER': {
                const t = getRecoil(trucks)
                let updateTrucks = t.map((trk: any) => {
                    if (trk.TrailerID === data.trailer) {
                        let updateSchedule = { ...trk.Schedule, IsHot: !trk.Schedule.IsHot }
                        return {...trk, Schedule: updateSchedule}
                    }
                    return trk
                })
                setRecoil(trucks, updateTrucks)
                break;
            }
            case 'TRAILER_ARRIVED': {
                console.log('arrived')
                const t = getRecoil(trucks)
                let updatedTrucks = t.map((trk: any) => {
                    if (trk.TrailerID === data.trailer) {
                      // Clone the Schedule object and update its IsHot property
                      let updatedSchedule = { ...trk.Schedule, ArrivalTime: data.time };
                      // Return a new truck object with the updated Schedule
                      return { ...trk, Schedule: updatedSchedule };
                    }
                    return trk;
                  });
                setRecoil(trucks, updatedTrucks)
                break;
            }
            case 'TRAILER_SCHEDULED': {
                console.log('scheduled')
                const t = getRecoil(trucks)
                let updatedTrucks = t.map((trk: any) => {
                    if (trk.TrailerID === data.trailer) {
                      // Clone the Schedule object and update its IsHot property
                      let updatedSchedule = { ...trk.Schedule, 
                                                RequestDate: data.rqd,
                                                LastFreeDate: data.lfd,
                                                ScheduleDate: data.scd,
                                                ScheduleTime: data.sct,
                                                CarrierCode: data.scac,
                                                 };
                      // Return a new truck object with the updated Schedule
                      return { ...trk, Schedule: updatedSchedule };
                    }
                    return trk;
                  });
                setRecoil(trucks, updatedTrucks)
                break;
            }
            default: break;
        }
    })
}

export const updateTrailer = (trailer: any) => {
    socket.emit('hot-trailer', {
        trailer
    }) 
}

export const trailerArrived = (trailer: any, time: any) => {
    socket.emit('trailer-arrived', {
        trailer,
        time
    }) 
}

export const trailerScheduled = (
    trailer: any,
    event: string,
    lfd: string,
    scd: string,
    sct: string,
    scac: string,
    rqd: string
) => {
    socket.emit('trailer-scheduled', {
        trailer,
        event,
        lfd,
        scd,
        sct,
        scac,
        rqd
    })
}

export const removeUser = (username: any) => {
    socket.emit('remove-user', username)
}

export const sendMessage = (username: any, message: any) => {
    socket.emit('register-new-user', {
        username,
        socketId: socket.id,
        message
    })
}

/*const handleBroadcastEvents = event => {
    switch event {
        case 'ACTIVE_USERS'
    }
}*/
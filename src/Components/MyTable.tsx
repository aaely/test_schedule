/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { trucks as trk, currentTruck as ct } from '../Recoil/trucks'
import { currentView, lastPage } from '../Recoil/router'
import { Button } from 'react-bootstrap'
import { getTrucks } from '../queries/getTrucks'
import { role } from '../Recoil/user';
import './CSS/MyTable.css'
import { api } from '../utils/api'
import { ws } from '../Recoil/socket'


export default function MyTable() {
  const [trucks, setTrucks] = useRecoilState(trk)
  const [view, setView] = useRecoilState(currentView)
  const setCurrentTruck = useSetRecoilState(ct)
  const last = useSetRecoilState(lastPage)
  const myRole = useRecoilValue(role)
  const w: any = useRecoilValue(ws)



  const updateView = (tr: any, screen: string) => {
    last(view)
    setView(screen)
    setCurrentTruck(tr)
  }

  useEffect(() => {
    (async () => {
      try {
        const trks = await getTrucks()
        setTrucks(trks)
        
        return () => {
          console.log('dismount landing')
        }
      } catch(error) {
        console.log(error)
      }
    })()
  }, [])

  const Hot = async (trl: string) => {

    w.send(JSON.stringify({
      type: 'hot_trailer',
      data: {
        message: trl
      }
    }))
    //updateTrailer(trl)
    try {
      const res = await api.post(`http://${process.env.REACT_APP_IP_ADDR}:${process.env.REACT_APP_PORT}/api/hot_trailer`, {TrailerID: trl})
      console.log(res)
    } catch(error) {
      console.log(error)
    }
  }

  const Arrived = async (trl: string) => {
    const now = new Date(Date.now()).toLocaleTimeString()
    const msg = {
      TrailerID: trl,
      ArrivalTime: now
    }
    w.send(JSON.stringify({
        type: 'trailer_arrived',
        data: {
          message: JSON.stringify(msg)
        }
      }))
    try {
      const res = await api.post(`http://${process.env.REACT_APP_IP_ADDR}:${process.env.REACT_APP_PORT}/api/set_arrivalTime`, {TrailerID: trl, ArrivalTime: now})
      console.log(res)
    } catch(error) {
      console.log(error)
    }
  }

  const renderLocations: any = (locations: any) => {
    let txt: string = ''
    for(let i = 0; i < locations.length; i++) {
        if (locations[i] === '18008') {
            txt = txt + ' AR'
        }
        if (locations[i] === '18044') {
            txt = txt + ' FF'
        }
        if (locations[i] === '22010') {
            txt = txt + ' 40'
        }
    }
    return txt.trim()
  }


  const renderTrucks = () => {
      return trucks?.map((tr: any, index: number) => {
        return(
          <tr key={index} style={{ backgroundColor: tr.Schedule.IsHot ? 'red' : 'inherit' }}>
              <td>{index + 1}</td>
              <td>{tr.Schedule.RequestDate}</td>
              <td><a onClick={() => updateView(tr, 'loadDetails')}>{tr.TrailerID}</a></td>
              <td>{tr.Schedule.CarrierCode}</td>
              <td>{renderLocations(tr.CiscoIDs)}</td>
              <td>{tr.Schedule.LastFreeDate}</td>
              <td>{tr.Schedule.ScheduleDate}</td>
              <td>{tr.Schedule.ScheduleTime}</td>
              <td>{tr.Schedule.ArrivalTime.length === 0 && tr.Schedule.ScheduleDate.length > 0 && myRole === 'write' ? <Button variant='success' onClick={() => Arrived(tr.TrailerID)}>Check In</Button> : tr.Schedule.ArrivalTime}</td>
              <td>{tr.Schedule.DoorNumber}</td>
              <td>{tr.Schedule.IsHot ? <Button variant='success' onClick={() => Hot(tr.TrailerID)}>Mark Not Hot</Button> : <Button variant='danger' onClick={() => Hot(tr.TrailerID)}>Mark Hot</Button>}</td>
              <td>{myRole === 'write' && <Button color='success' onClick={() => updateView(tr, 'editTrailer')}>Edit</Button>}</td>
          </tr>          
        )
      });
  }

    return(
      <div>
        <h1 style={{textAlign: 'center'}}>All Trucks</h1>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Request Date</th>
              <th>Trailer ID</th>
              <th>SCAC</th>
              <th>Plant</th>
              <th>Last Free Day</th>
              <th>Scheduled Date</th>
              <th>Scheduled Time</th>
              <th>Arrival Time</th>
              <th>Door</th>
              <th>Hot?</th>
            </tr>
          </thead>
          <tbody>
            {renderTrucks()}
          </tbody>
        </table>
      </div>
    )
}
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { trucks as trk, currentTruck as ct } from '../Recoil/trucks'
import { currentView, lastPage } from '../Recoil/router'
import { Button } from 'react-bootstrap'
import { updateTrailer, trailerArrived } from '../socket'
import axios from 'axios'
import { getTrucks } from '../queries/getTrucks'
import './CSS/MyTable.css'


export default function MyTable() {
  const [trucks, setTrucks] = useRecoilState(trk)
  const [view, setView] = useRecoilState(currentView)
  const setCurrentTruck = useSetRecoilState(ct)
  const last = useSetRecoilState(lastPage)

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

    
    updateTrailer(trl)
    try {
      const res = await axios.post(`http://${process.env.REACT_APP_IP_ADDR}:5555/api/hot_trailer`, {param: trl})
      console.log(res)
    } catch(error) {
      console.log(error)
    }
  }

  const Arrived = async (trl: string) => {
    const now = new Date(Date.now()).toLocaleTimeString()
    trailerArrived(trl, now)
    try {
      const params = {
        TrailerID: trl,
        ArrivalTime: now
      }
      const res = await axios.post(`http://${process.env.REACT_APP_IP_ADDR}:5555/api/set_arrivalTime`, {params})
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
              <td>{tr.Schedule.ArrivalTime.length === 0 && tr.Schedule.ScheduleDate.length > 0 ? <Button variant='success' onClick={() => Arrived(tr.TrailerID)}>Check In</Button> : tr.Schedule.ArrivalTime}</td>
              <td>{tr.Schedule.DoorNumber}</td>
              <td>{tr.Schedule.IsHot ? <Button variant='success' onClick={() => Hot(tr.TrailerID)}>Mark Not Hot</Button> : <Button variant='danger' onClick={() => Hot(tr.TrailerID)}>Mark Hot</Button>}</td>
              <td><Button color='success' onClick={() => updateView(tr, 'editTrailer')}>Edit</Button></td>
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
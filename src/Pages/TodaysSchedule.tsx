import React, { useEffect } from 'react'
import { useSignal } from '@preact/signals-react'
import { currentTruck, trucks } from '../Recoil/trucks'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { Button } from 'react-bootstrap'
import { getTrucksByDate } from '../queries/get_trucks_by_date'
import { currentView, lastPage } from '../Recoil/router'
import '../Components/CSS/MyTable.css'
import axios from 'axios'
import { trailerArrived } from '../socket'

function TodaysSchedule() {
    
    const [view, setView] = useRecoilState(currentView)
    const setCurrentTruck = useSetRecoilState(currentTruck)
    const [trks, setTrucks] = useRecoilState(trucks)
    const [last, setLast] = useRecoilState(lastPage)

    useEffect(() => {
        (async() => {
            try{
                const today = formatDate(new Date(Date.now()).toLocaleDateString())
                const res = await getTrucksByDate(today)
                setTrucks(res)
            } catch(error) {
                console.log(error)
            }
        })()
    },[])

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

    const updateView = (tr: any, screen: string) => {
        setLast(view)
        console.log(last)
        setView(screen)
        setCurrentTruck(tr)
    }

    function formatDate(inputDate: string) {
        const parts = inputDate.split('/');
        if (parts.length !== 3) {
            // Invalid date format
            return null;
        }
        
        const [month, day, year] = parts;
        const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        return formattedDate;
    }

    const Arrived = async (trl: string) => {
        const now = new Date(Date.now()).toLocaleTimeString()
        trailerArrived(trl, now)
        try {
          const params = {
            TrailerID: trl,
            ArrivalTime: now
          }
          const res = await axios.post('http://192.168.4.70:5555/api/set_arrivalTime', {params})
        } catch(error) {
          console.log(error)
        }
      }
    
    const renderTrucks = () => {
        return trks?.map((tr: any, index: number) => {
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
                <td>{tr.Schedule.DoorNumber.length < 1 ? <Button color='success' onClick={() => updateView(tr, 'assignDoor')}>Assign Door</Button> : <a onClick={() => updateView(tr, 'assignDoor')}>{tr.Schedule.DoorNumber}</a>}</td>
                
                <td><Button color='success' onClick={() => updateView(tr, 'editTrailer')}>Edit</Button></td>
            </tr>          
        )
        });
    }

    return(
        <div className='container'>
            <h1 style={{textAlign: 'center'}}>Today's Schedule</h1>
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
                </tr>
            </thead>
            <tbody>
                {renderTrucks()}
            </tbody>
            </table>
        </div>
    )
}

export default TodaysSchedule
import React, { useEffect } from 'react'
import { useSignal } from '@preact/signals-react'
import { currentTruck, trucks } from '../Recoil/trucks'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { getTrucksByDate } from '../queries/get_trucks_by_date'
import { currentView, lastPage } from '../Recoil/router'
import '../Components/CSS/MyTable.css'
import axios from 'axios'
import { trailerArrived } from '../socket'
import {Button} from 'react-bootstrap'
import { role } from '../Recoil/user';
import CreateCSV from '../Components/CreateCSV'
import { CSVLink } from "react-csv";

function TodaysSchedule() {
    
    const [view, setView] = useRecoilState(currentView)
    const setCurrentTruck = useSetRecoilState(currentTruck)
    const [trks, setTrucks] = useRecoilState(trucks)
    const [last, setLast] = useRecoilState(lastPage)
    const currentDate = new Date(Date.now()).toLocaleDateString();
    const myRole = useRecoilValue(role)

    useEffect(() => {
        (async() => {
            try{
                const today = formatDate(new Date(Date.now()).toLocaleDateString())
                const res = await getTrucksByDate(today)
                res.sort((a: any, b: any) => {
                    const [hoursA, minutesA] = a.Schedule.ScheduleTime.split(':').map(Number);
                    const [hoursB, minutesB] = b.Schedule.ScheduleTime.split(':').map(Number);
                    
                    if (hoursA === hoursB) {
                        return minutesA - minutesB;
                    } else {
                        return hoursA - hoursB;
                    }
                });
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
          const res = await axios.post(`http://${process.env.REACT_APP_IP_ADDR}:5555/api/set_arrivalTime`, {params})
        } catch(error) {
          console.log(error)
        }
    }

    const data = () => {
        let c = []
        let headers = ['Container ID', 'Request Date', 'SCSC Code', 'Schedule Date', 'Schedule Time', 'Arrival Time', 'Door Number', 'Contact Email']
        c.push(headers)
        for(let i = 0; i < trks?.length; i++) {
            let row = []
            row.push(trks[i].TrailerID)
            row.push(trks[i].Schedule.RequestDate)
            row.push(trks[i].Schedule.CarrierCode)
            row.push(trks[i].Schedule.ScheduleDate)            
            row.push(trks[i].Schedule.ScheduleTime)            
            row.push(trks[i].Schedule.ArrivalTime)            
            row.push(trks[i].Schedule.DoorNumber)
            row.push(trks[i].Schedule.ContactEmail)
            c.push(row)
        }
        return c
    }

    const csv = data()

    const renderTrucks = () => {
        return trks?.map((tr: any, index: number) => {
        return(
            <tr key={index} style={{ backgroundColor: tr.Schedule.IsHot ? 'red' : 'inherit' }}>
                <td>{index + 1}</td>
                <td>{tr.Schedule.RequestDate}</td>
                <td><a onClick={() => updateView(tr, 'loadDetails')}>{tr.TrailerID}</a></td>
                <td>{tr.Schedule.CarrierCode}</td>
                <td>{tr.CiscoIDs.length > 0 && renderLocations(tr.CiscoIDs)}</td>
                <td>{tr.Schedule.LastFreeDate}</td>
                <td>{tr.Schedule.ScheduleDate}</td>
                <td>{tr.Schedule.ScheduleTime}</td>
                <td>{tr.Schedule.ArrivalTime.length === 0 && tr.Schedule.ScheduleDate.length > 0 && myRole === 'write' ? <Button variant='success' onClick={() => Arrived(tr.TrailerID)}>Check In</Button> : tr.Schedule.ArrivalTime}</td>
                <td>{tr.Schedule.DoorNumber.length < 1 && myRole === 'write' ? <Button color='success' onClick={() => updateView(tr, 'assignDoor')}>Assign Door</Button> : <a onClick={() => updateView(tr, 'assignDoor')}>{tr.Schedule.DoorNumber}</a>}</td>
                <td>{myRole === 'write' && <Button color='success' onClick={() => updateView(tr, 'editTrailer')}>Edit</Button>}</td>
            </tr>          
        )
        });
    }

    return(
        <div className='container'>
            <h1 style={{textAlign: 'center'}}>Today's Schedule</h1>
            <CSVLink style={{margin: '3%'}} data={csv} filename='todaysTrucks'>Export to Excel</CSVLink>
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
            <CreateCSV />
        </div>
    )
}

export default TodaysSchedule
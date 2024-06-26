import React, { useEffect } from 'react'
import { signal } from '@preact/signals-react'
import { currentTruck, datedTrucks, date1, date2 } from '../Recoil/trucks'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { Button } from 'react-bootstrap'
import { getTrucksByDate } from '../queries/get_trucks_by_date'
import { currentView, lastPage } from '../Recoil/router'
import '../Components/CSS/MyTable.css'
import axios from 'axios'
import { FormControl, Input, InputAdornment, InputLabel } from '@mui/material'
import { SiCheckmarx } from 'react-icons/si'
import { FaDollarSign } from 'react-icons/fa'
import { getTrucksByDateRange } from '../queries/get_trucks_date_range'
import { trailerArrived } from '../socket'
import { role, token } from '../Recoil/user';

function TrucksByDate() {
    
    const [view, setView] = useRecoilState(currentView)
    const setCurrentTruck = useSetRecoilState(currentTruck)
    const [dt, setDt] = useRecoilState(datedTrucks);
    const [last, setLast] = useRecoilState(lastPage)
    const [date, setDate] = useRecoilState(date1)
    const [d2, setDate2] = useRecoilState(date2)
    const myRole = useRecoilValue(role)
    const setToken = useSetRecoilState(token)

    const getTrucks = async () => {
        try {
            const res = await getTrucksByDateRange(date, d2)
            res.sort((a: any, b: any) => {
                const [hoursA, minutesA] = a.Schedule.ScheduleTime.split(':').map(Number);
                const [hoursB, minutesB] = b.Schedule.ScheduleTime.split(':').map(Number);
                
                if (hoursA === hoursB) {
                    return minutesA - minutesB;
                } else {
                    return hoursA - hoursB;
                }
            });
            setDt(res)
        } catch(error) {
            console.log(error)
            setToken('')
        }
    }

    const handleChange = ({target: { id, value}}: any) => {
        switch(id) {
            case 'date1':
                setDate(value)
                break;
            case 'date2': 
                setDate2(value)
                break;
            default: break;
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

    const updateView = (tr: any, screen: string) => {
        setLast(view)
        console.log(last)
        setView(screen)
        setCurrentTruck(tr)
    }

    const Arrived = async (trl: string) => {
        const now = new Date(Date.now()).toLocaleTimeString()
        //trailerArrived(trl, now)
        try {
          const res = await axios.post(`https://${process.env.REACT_APP_IP_ADDR}:${process.env.REACT_APP_PORT}/api/set_arrivalTime`, {TrailerID: trl, ArrivalTime: now})
          console.log(res.data)
        } catch(error) {
          console.log(error)
        }
      }
    
    const renderTrucks = () => {
        return dt?.map((tr: any, index: number) => {
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
                    <td>{tr.Schedule.DoorNumber.length < 1 && myRole === 'write' ? <Button color='success' onClick={() => updateView(tr, 'assignDoor')}>Assign Door</Button> : <a onClick={() => updateView(tr, 'assignDoor')}>{tr.Schedule.DoorNumber}</a>}</td>
                    
                    <td>{myRole === 'write' && <Button color='success' onClick={() => updateView(tr, 'editTrailer')}>Edit</Button>}</td>
                </tr>          
            )
        });
    }

    return(
        <div className='container'>
            <FormControl sx={{ m: 1, width: '25ch' }} variant="standard">
                <InputLabel htmlFor="lastFreeDate">Start Date</InputLabel>
                <Input
                id='date1'
                type='date'
                value={date}
                onChange={handleChange}
                startAdornment={
                    <InputAdornment position='start'>
                        <FaDollarSign/>
                    </InputAdornment>
                }
                />
            </FormControl>
            <FormControl sx={{ m: 1, width: '25ch' }} variant="standard">
                <InputLabel htmlFor="scheduledDate">End Date</InputLabel>
                <Input
                id='date2'
                type='date'
                value={d2}
                onChange={handleChange}
                startAdornment={
                    <InputAdornment position='start'>
                        <SiCheckmarx/>
                    </InputAdornment>
                }
                />
            </FormControl>
            {date.length > 0 && d2.length > 0 && <Button color='success' onClick={() => getTrucks()}>Search</Button>}
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

export default TrucksByDate
import React, { useEffect } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { currentTruck as t } from '../Recoil/trucks'
import { currentView, lastPage } from '../Recoil/router';
import { scac as s, scheduledDate as sd, lastFreeDate as fd, scheduledTime as st, contactEmail} from '../Recoil/forms';
import './CSS/EditTrailer.css'
import Button from '@mui/material/Button'
import { Box } from '@mui/material';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import {SiMoleculer, SiCheckmarx} from 'react-icons/si'
import {FaDollarSign} from 'react-icons/fa'
import { recent } from '../Recoil/trucks';
import { BiMailSend } from "react-icons/bi";
import axios from 'axios';
import { trailerScheduled } from '../socket';


function ScheduleTruckForm() {
    const [currentTruck, setCurrentTruck] = useRecoilState(t)
    const currentDate = new Date(Date.now()).toLocaleDateString();
    const [scac, setScac] = useRecoilState(s)
    const [scheduledDate, setScheduledDate] = useRecoilState(sd)
    const [lastFreeDate, setLastFreeDate] = useRecoilState(fd)
    const [scheduledTime, setScheduledTime] = useRecoilState(st)
    const [r, setR] = useRecoilState(recent)
    const [ce, setCe] = useRecoilState(contactEmail)
    //const formattedDate = `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getDate().toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
    const [view, setView] = useRecoilState(currentView)
    const [last, setLast] = useRecoilState(lastPage)

    const handleChange = ({target: { id, value}}: any) => {
        switch(id) {
            case 'scac':
                setScac(value)
                break;
            case 'scheduledDate': 
                setScheduledDate(value)
                break;
            case 'lastFreeDate':
                setLastFreeDate(value)
                break;
            case 'scheduledTime':
                setScheduledTime(value)
                break;
            case 'contactEmail':
                setCe(value)
                break;
            default: break;
        }
    }

    const updateView = (screen: string) => {
        setLast(view)
        setView(screen)
    }

    useEffect(() => {
        if(currentTruck.Schedule.CarrierCode.length > 1) {
            setScac(currentTruck.Schedule.CarrierCode)
        }
        setScheduledDate(currentTruck.Schedule.ScheduleDate)
        setLastFreeDate(currentTruck.Schedule.LastFreeDate)
        setScheduledTime(currentTruck.Schedule.ScheduleTime)
        if(currentTruck.Schedule.ContactEmail?.length > 0) {
            setCe(currentTruck.Schedule.ContactEmail)
        }
    }, [])

    const setDetails = async () => {
        setLast(view)
        setView('landing')
        const recentTrucks = [...r]
        const next = {
            TrailerID: currentTruck.TrailerID,
            ScheduleDate: scheduledDate,
            ScheduleTime: scheduledTime,
            Carrier: scac
        }
        recentTrucks.push(next)
        setR(recentTrucks)
        trailerScheduled(
            currentTruck.TrailerID,
            'TRAILER_SCHEDULED',
            lastFreeDate,
            scheduledDate,
            scheduledTime,
            scac,
            currentDate
        )
        try {
            const params = {
                TrailerID: currentTruck.TrailerID,
                ScheduleTime: scheduledTime,
                ScheduledDate: scheduledDate,
                RequestDate: currentDate,
                LastFreeDate: lastFreeDate,
                CarrierCode: scac,
                ContactEmail: ce,
            }
            const res = await axios.post(`http://${process.env.REACT_APP_IP_ADDR}:5555/api/set_schedule`, params)
        } catch(error) {
            console.log(error)
        }
    }

    return(
        <Box className='container'>
            <h1>Schedule Trailer: {currentTruck.TrailerID}</h1>
                <FormControl sx={{ m: 1, width: '25ch' }} variant="standard">
                <InputLabel htmlFor="scac">SCAC</InputLabel>
                <Input
                id='scac'
                type='text'
                value={scac}
                onChange={handleChange}
                placeholder='UNIV'
                startAdornment={
                    <InputAdornment position='start'>
                        <SiMoleculer/>
                    </InputAdornment>
                }
                />
                </FormControl>
                <FormControl sx={{ m: 1, width: '25ch' }} variant="standard">
                <InputLabel htmlFor="lastFreeDate">Last Free Date</InputLabel>
                <Input
                id='lastFreeDate'
                type='date'
                value={lastFreeDate}
                onChange={handleChange}
                startAdornment={
                    <InputAdornment position='start'>
                        <FaDollarSign/>
                    </InputAdornment>
                }
                />
                </FormControl>
                <FormControl sx={{ m: 1, width: '25ch' }} variant="standard">
                <InputLabel htmlFor="scheduledDate">Scheduled Date</InputLabel>
                <Input
                id='scheduledDate'
                type='date'
                value={scheduledDate}
                onChange={handleChange}
                startAdornment={
                    <InputAdornment position='start'>
                        <SiCheckmarx/>
                    </InputAdornment>
                }
                />
                </FormControl>
                <FormControl sx={{ m: 1, width: '25ch' }} variant="standard">
                <InputLabel htmlFor="scheduledTime">Scheduled Time</InputLabel>
                <Input
                id='scheduledTime'
                type='text'
                value={scheduledTime}
                onChange={handleChange}
                placeholder='7:00'
                startAdornment={
                    <InputAdornment position='start'>
                        <SiMoleculer/>
                    </InputAdornment>
                }
                />
                </FormControl>
                <FormControl sx={{ m: 1, width: '25ch' }} variant="standard">
                <InputLabel htmlFor="contactEmail">Contact Email</InputLabel>
                <Input
                id='contactEmail'
                type='text'
                value={ce}
                onChange={handleChange}
                placeholder='example@gmail.com'
                startAdornment={
                    <InputAdornment position='start'>
                        <BiMailSend/>
                    </InputAdornment>
                }
                />
                </FormControl>
                <Button variant='contained' color='success' onClick={() => setDetails()}>Set Details</Button>
                <Button variant='contained' color='error' onClick={() => updateView(last)}>Back</Button>
        </Box>
    )
}

export default ScheduleTruckForm
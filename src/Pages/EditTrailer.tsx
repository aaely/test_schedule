import React, { useEffect } from 'react'
import { useRecoilState } from 'recoil'
import { currentTruck as t } from '../Recoil/trucks'
import { currentView, lastPage } from '../Recoil/router';
import { truckForm } from '../Recoil/forms';
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
import { api } from '../utils/api';


function ScheduleTruckForm() {
    const [currentTruck, setCurrentTruck] = useRecoilState(t)
    const currentDate = new Date(Date.now()).toLocaleDateString();
    const [r, setR] = useRecoilState(recent)
    //const formattedDate = `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getDate().toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
    const [view, setView] = useRecoilState(currentView)
    const [last, setLast] = useRecoilState(lastPage)
    const [form, setForm] = useRecoilState(truckForm)

    const handleChange = ({target: { id, value}}: any) => {
        setForm({
            ...form,
            [id]: value
        })
    }

    const updateView = (screen: string) => {
        setLast(view)
        setView(screen)
    }

    useEffect(() => {
        setForm({
            ...form, 
            scheduledDate: currentTruck.Schedule.ScheduleDate,
            lastFreeDate: currentTruck.Schedule.LastFreeDate,
            scheduledTime: currentTruck.Schedule.ScheduleTime,
            contactEmail: currentTruck.Schedule.ContactEmail,
            scac: currentTruck.Schedule.CarrierCode
        })
    }, [])

    const setDetails = async () => {
        const recentTrucks = [...r]
        const next = {
            TrailerID: currentTruck.TrailerID,
            ScheduleDate: form.scheduledDate,
            ScheduleTime: form.scheduledTime,
            Carrier: form.scac
        }
        const index = recentTrucks.findIndex((x: any) => x.TrailerID === currentTruck.TrailerID)
        if (index < 0) {
            recentTrucks.push(next)
        } else {
            recentTrucks.splice(index, 1, next)
        }
        setR(recentTrucks)
        trailerScheduled(
            currentTruck.TrailerID,
            'TRAILER_SCHEDULED',
            form.lastFreeDate,
            form.scheduledDate,
            form.scheduledTime,
            form.scac,
            currentDate
        )
        setTimeout(() => {setView(last)}, 200)
        try {
            const params = {
                TrailerID: currentTruck.TrailerID,
                ScheduleTime: form.scheduledTime,
                ScheduledDate: form.scheduledDate,
                RequestDate: currentDate,
                LastFreeDate: form.lastFreeDate,
                CarrierCode: form.scac,
                ContactEmail: form.contactEmail,
            }
            const res = await api.post(`http://${process.env.REACT_APP_IP_ADDR}:5555/api/set_schedule`, params)
            console.log(res)
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
                value={form.scac}
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
                value={form.lastFreeDate}
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
                value={form.scheduledDate}
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
                value={form.scheduledTime}
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
                value={form.contactEmail}
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
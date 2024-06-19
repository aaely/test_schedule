import React, { useEffect } from 'react'
import { currentTruck, currentTruck as t } from '../Recoil/trucks'
import { currentView, lastPage } from '../Recoil/router';
import { truckForm } from '../Recoil/forms';
import './CSS/EditTrailer.css'
import { Box, Button, FormControl, Input, InputAdornment, InputLabel } from '@mui/material';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { SiMoleculer } from 'react-icons/si';
import { api } from '../utils/api';
import { ws } from '../Recoil/socket';
import { token } from '../Recoil/user';

function AssignDoor() {

    const [view, setView] = useRecoilState(currentView)
    const truck = useRecoilValue(currentTruck)
    const [form, setForm] = useRecoilState(truckForm)
    const [last, setLast] = useRecoilState(lastPage)
    const w: any = useRecoilValue(ws)
    const setToken = useSetRecoilState(token)

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
        setForm({...form, door: truck.Schedule.DoorNumber})
    },[])

    const setDoor = async () => {
        const msg = {
            TrailerID: truck.TrailerID,
            Door: form.door
          }
        w.send(JSON.stringify({
            type: 'set_door',
            data: {
                message: JSON.stringify(msg)
            }
        }))
        setTimeout(() => {setView(last)}, 200)
        try {
            const params = {
                TrailerID: truck.TrailerID,
                Door: form.door
            }
            const res= await api.post(`https://${process.env.REACT_APP_IP_ADDR}:${process.env.REACT_APP_PORT}/api/set_door`, params)
            console.log(res)
        } catch(error) {
            console.log(error)
            setToken('')
        }
    }


    return(
        <Box className='container'>
            <FormControl sx={{ m: 1, width: '25ch' }} variant="standard">
                <InputLabel htmlFor="door">Door</InputLabel>
                <Input
                id='door'
                type='text'
                value={form.door}
                onChange={handleChange}
                placeholder='149'
                startAdornment={
                    <InputAdornment position='start'>
                        <SiMoleculer/>
                    </InputAdornment>
                }
                />
            </FormControl>
            <Button variant='contained' color='success' onClick={() => setDoor()}>Set Details</Button>
            <Button variant='contained' color='error' onClick={() => updateView(last)}>Back</Button>
        </Box>
    )
}

export default AssignDoor
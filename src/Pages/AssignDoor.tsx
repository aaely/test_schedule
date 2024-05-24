import React, { useEffect } from 'react'
import { currentTruck, currentTruck as t } from '../Recoil/trucks'
import { currentView, lastPage } from '../Recoil/router';
import { door } from '../Recoil/forms';
import './CSS/EditTrailer.css'
import { Box, Button, FormControl, Input, InputAdornment, InputLabel } from '@mui/material';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import axios from 'axios';
import { SiMoleculer } from 'react-icons/si';

function AssignDoor() {

    const [view, setView] = useRecoilState(currentView)
    const truck = useRecoilValue(currentTruck)
    const [d, setD] = useRecoilState(door)
    const [last, setLast] = useRecoilState(lastPage)

    const handleChange = ({target: { id, value}}: any) => {
        switch(id) {
            case 'door':
                setD(value)
                break;
            default: break;
        }
    }

    const updateView = (screen: string) => {
        setLast(view)
        setView(screen)
    }

    useEffect(() => {
        setD(truck.Schedule.DoorNumber)
    },[])

    const setDoor = async () => {
        setView(last)
        try {
            const params = {
                TrailerID: truck.TrailerID,
                Door: d
            }
            await axios.post('http://192.168.4.70:5555/api/set_door', params)
        } catch(error) {
            console.log(error)
        }
    }


    return(
        <Box className='container'>
            <FormControl sx={{ m: 1, width: '25ch' }} variant="standard">
                <InputLabel htmlFor="door">Door</InputLabel>
                <Input
                id='door'
                type='text'
                value={d}
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
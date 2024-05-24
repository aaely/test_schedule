import { Box, Button } from '@mui/material'
import React from 'react'
import './CSS/EditTrailer.css'
import { recent } from '../Recoil/trucks'
import { useRecoilState } from 'recoil'

function RecentTrucks() {

    const [r, setR] = useRecoilState(recent)

    const clear = () => {
        setR([])
    }

    return(
        <Box className='container'>
            {r.map((truck: any, index: number) => {
                return(
                   <p key={index}>{truck.TrailerID}  ||  {truck.ScheduleDate}  ||  {truck.ScheduleTime}</p> 
                )
            })}
            <Button color='error' onClick={() => clear()}>Clear Recent</Button>
        </Box>
    )
}

export default RecentTrucks
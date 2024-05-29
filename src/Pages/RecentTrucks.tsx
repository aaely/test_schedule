import { Box, Button } from '@mui/material'
import React from 'react'
import './CSS/EditTrailer.css'
import { recent } from '../Recoil/trucks'
import { useRecoilState } from 'recoil'
import { CSVLink } from "react-csv";

function RecentTrucks() {

    const [r, setR] = useRecoilState(recent)

    const clear = () => {
        setR([])
    }

    const csvData = () => {
        let c = []
        for(let i = 0; i < r.length; i++) {
            let row = []
            row.push(r[i].TrailerID)
            row.push(r[i].ScheduleDate)
            row.push(r[i].ScheduleTime)
            row.push(r[i].Carrier)
            c.push(row)
        }
        return c
    }

    const csv = csvData()

    return(
        <Box className='container'>
            {r.map((truck: any, index: number) => {
                return(
                   <p key={index}>{truck.TrailerID}  ||  {truck.ScheduleDate}  ||  {truck.ScheduleTime}</p> 
                )
            })}
            <CSVLink style={{margin: '5%'}} filename='recentTrucks' data={csv}>Download CSV</CSVLink>
            <Button color='error' onClick={() => clear()}>Clear Recent</Button>
        </Box>
    )
}

export default RecentTrucks
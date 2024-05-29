import React, { useEffect, useState } from 'react'
import { currentTruck as c, loadDetails} from '../Recoil/trucks'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { get_csv_data } from '../queries/get_csv_data'
import { Box, Button } from '@mui/material'
import './CSS/EditTrailer.css'
import { currentView, lastPage } from '../Recoil/router'
import { CSVLink } from "react-csv";

function CreateCSV() {

    const [trucks, setTrucks] = useState<any>([])
    const [view, setView] = useRecoilState(currentView)
    const [last, setLast] = useRecoilState(lastPage)

    const currentDate = new Date(Date.now());
    const formattedDate = formatDate(currentDate);

    function formatDate(date: any) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    useEffect(() => {
        (async() => {
            try{
                const res = await get_csv_data(formattedDate)
                console.log(formattedDate, res)
                setTrucks(res)
            } catch(error) {
                console.log(error)
            }
        })()
        return () => {
            console.log('unmount')
        }
    }, [])

    const updateView = (screen: string) => {
        setLast(view)
        setView(screen)
    }

    const renderLocation = (loc: string) => {
        if(loc === '18008') {
            return 'AR'
        }
        if(loc === '18044') {
            return 'FF'
        }
        if(loc === '22010') {
            return '40'
        }
        return ''
    }

    const createCsvData = () => {
        let c = []
        for(let i = 0; i < trucks?.length; i ++) {
            for(let j = 0; j < trucks[i].Sids?.length; j++) {
                let sid = trucks[i].TrailerID + renderLocation(trucks[i].Sids[j].cisco)
                let row = []
                row.push(sid)
                row.push(trucks[i].Sids[j].partNumber)
                row.push(trucks[i].Sids[j].quantity.low)
                row.push('DAL')
                row.push('P')
                row.push(',')
                row.push(renderLocation(trucks[i].Sids[j].cisco))
                row.push(formattedDate)
                row.push(trucks[i].TrailerID)
                row.push('1')
                c.push(row)
            }
        }
        return c
    }

    const csv = createCsvData()

    return (
        <Box className='container'>
            <CSVLink style={{margin: '5%'}} filename='receipt01' data={csv}>Download CSV</CSVLink>
            <Button style={{margin: '30px'}} variant='contained' color='error' onClick={() => updateView(last)}>Back</Button>
        </Box>
    )

}

export default CreateCSV
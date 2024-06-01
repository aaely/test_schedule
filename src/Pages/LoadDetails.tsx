import React, { useEffect, useState } from 'react'
import { currentTruck as c, loadDetails} from '../Recoil/trucks'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { get_load_info } from '../queries/get_load_info'
import { Box, Button } from '@mui/material'
import './CSS/EditTrailer.css'
import { currentView, lastPage } from '../Recoil/router'
import { CSVLink, CSVDownload } from "react-csv";

function LoadDetails() {

    const currentTruck = useRecoilValue(c)
    const [l, setL] = useRecoilState(loadDetails)
    const [view, setView] = useRecoilState(currentView)
    const [last, setLast] = useRecoilState(lastPage)

    const currentDate = new Date(Date.now());
    const formattedDate = formatDate(currentDate);

    function formatDate(date: any) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}${month}${day}`;
    }

    useEffect(() => {
        (async() => {
            try{
                const res = await get_load_info(currentTruck.TrailerID)
                res.sort((a: any, b: any) => a.Sids.ciscoID - b.Sids.ciscoID)
                setL(res)
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
        for(let i = 0; i < l.length; i ++) {
            let sid = currentTruck.TrailerID + renderLocation(l[i].Sids.ciscoID)
            for(let j = 0; j < l[i].Parts.length; j++) {
                let row = []
                row.push(sid)
                row.push(l[i].Parts[j].partNumber)
                row.push(l[i].Parts[j].quantity.low)
                row.push('DAL')
                row.push('P')
                row.push(',')
                row.push(renderLocation(l[i].Sids.ciscoID))
                row.push(formattedDate)
                row.push(currentTruck.TrailerID)
                row.push('1')
                c.push(row)
            }
        }
        return c
    }

    const csv = createCsvData()

    return (
        <Box className='container'>
            <h1>{currentTruck.TrailerID}</h1>
            {l?.map((sid: any, index: number) => {
                console.log(sid)
                return(
                    <React.Fragment>
                        <h3 style={{marginTop: '100px', marginBottom: '100px'}}>
                            {sid.Sids.id} {'\u00A0'}{'\u00A0'} || {'\u00A0'}{'\u00A0'} {renderLocation(sid.Sids.ciscoID)}
                        </h3>
                            <table>
                                <thead>
                                <tr>
                                    <td>Part Number</td>
                                    <td align="right">Quantity</td>
                                </tr>
                                </thead>
                                <tbody>                           
                        {sid?.Parts.map((part: any) => {
                            console.log(part.quantity.low)
                            return(
                                <React.Fragment>
                                    <tr>
                                        <td>
                                                {part.partNumber}
                                        </td>
                                        <td>
                                                {part.quantity.low}
                                        </td>
                                    </tr>
                                </React.Fragment>
                            )
                        })} 
                        </tbody>
                        </table>
                    </React.Fragment>
                )
            })}
            <CSVLink style={{margin: '5%'}} filename='receipt01' data={csv}>Download CSV</CSVLink>
            <Button style={{margin: '30px'}} variant='contained' color='error' onClick={() => updateView(last)}>Back</Button>
        </Box>
    )

}

export default LoadDetails
import React, { useEffect } from 'react'
import { useInterval } from './useInterval'
import axios from 'axios'

const useMonitorTimes = (trucks: any) => {
    const now = new Date(Date.now()).toLocaleTimeString()

    useInterval(() => {
        (async () => {
            try {
                for(let i = 0; i < trucks.length; i++) {
                    if(now >= trucks[i].ScheduleTime) {
                        if(trucks[i].ArrivalTime === undefined || trucks[i].ArrivalTime === '') {
                            const msg = {
                                to: 'primordialspirit33@gmail.com', // Change to your recipient
                                from: 'primordialspirit33@gmail.com', // Change to your verified sender
                                subject: 'Automated Truck Alerts',
                                text: 'and easy to do anywhere, even with Node.js',
                                html: '<strong>and easy to do anywhere, even with Node.js</strong>',
                            }
                            await axios.post('http://localhost:5555/api/send_email', msg)
                        }
                    }
                }
            } catch(error) {
                console.log(error)
            }
        })()
    }, 1000 * 60 * 15)

}

export default useMonitorTimes 
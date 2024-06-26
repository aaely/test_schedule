import { MutableRefObject, useRef, useState } from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { currentView } from '../Recoil/router'
import { recent } from '../Recoil/trucks'
import { token } from '../Recoil/user'

export default function Nav() {

    const setView = useSetRecoilState(currentView)
    const logout = useSetRecoilState(token)

    return (
        <div>
        <div style={{display: 'flex', 
                    position: 'fixed', 
                    justifyContent: 'space-around', 
                    alignContent: 'center', 
                    alignItems:'center', 
                    justifyItems: 'center',
                    width: '100vw',
                    height: '7vh',
                    backgroundColor: '#333', 
                    color: 'limegreen',
                    flexWrap: 'wrap'}}
                    >
            <div onClick={() => setView('landing')}>
                <a>All Trucks</a>
            </div>
            <div onClick={() => setView('recentTrucks')}>
                <a>Recently Scheduled</a>
            </div>
            <div onClick={() => setView('trucksByDate')}>
                <a>Trucks By Date Range</a>
            </div>
            <div onClick={() => setView('todaysSchedule')}>
                <a>Today's Schedule</a>
            </div>
            <div onClick={() => logout('')}>
                <a>Logout</a>
            </div>
        </div>
        </div>
    );
}
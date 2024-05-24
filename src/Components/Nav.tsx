import { MutableRefObject, useRef, useState } from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { currentView } from '../Recoil/router'
import { recent } from '../Recoil/trucks'

export default function Nav() {

    const setView = useSetRecoilState(currentView)

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
            <div>
                <a onClick={() => setView('landing')}>All Trucks</a>
            </div>
            <div>
                <a onClick={() => setView('recentTrucks')}>Recently Scheduled</a>
            </div>
            <div>
                <a onClick={() => setView('trucksByDate')}>Trucks By Date Range</a>
            </div>
            <div>
                <a onClick={() => setView('todaysSchedule')}>Today's Schedule</a>
            </div>
            <div>
                <a onClick={() => setView('createCsv')}>CSV</a>
            </div>
        </div>
        </div>
    );
}
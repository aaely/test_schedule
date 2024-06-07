import React from 'react';
import Landing from './Pages/Landing'
import useWebSocket from './hooks/useWebSocket';
import { useRecoilValue } from 'recoil';
import { currentView } from './Recoil/router';
import { animated, useTransition } from 'react-spring';
import EditTrailer from './Pages/EditTrailer';
import AssignDoor from './Pages/AssignDoor'
import LoadDetails from './Pages/LoadDetails';
import Nav from './Components/Nav';
import RecentTrucks from './Pages/RecentTrucks';
import TodaysSchedule from './Pages/TodaysSchedule'
import TrucksByDate from './Pages/TrucksByDate'
import CreateCSV from './Pages/CreateCSV';
import { token } from './Recoil/user';
import Login from './Pages/Login';


const hashMap = new Map([
  ['landing', <Landing />],
  ['editTrailer', <EditTrailer />],
  ['assignDoor', <AssignDoor />],
  ['loadDetails', <LoadDetails />],
  ['recentTrucks', <RecentTrucks />],
  ['todaysSchedule', <TodaysSchedule />],
  ['trucksByDate', <TrucksByDate />],
  ['createCsv', <CreateCSV />]
]) 

function App() {

  const view: string = useRecoilValue(currentView)
  const tkn = useRecoilValue(token)

  useWebSocket()

  const transition = useTransition(view, {
    from: {opacity: 0, scale: 0},
    enter: {opacity: 1, scale: 1},
    leave: {opacity: 0, scale: 0},
  })

  return transition((style, i) => {
    return (
      <div style={{position: 'absolute', width: '100vw', height: '100vh'}}>
        {tkn.length > 0 ? 
        <><Nav /><animated.div style={style}>
            {hashMap.get(i)}
          </animated.div></>
        :
        <Login />
        }
      </div>
    )
  })
}

export default App

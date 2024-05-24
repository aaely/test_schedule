import React from 'react';
import logo from '../logo.svg';
import '../Components/CSS/MyTable.css'
import MyTable from '../Components/MyTable';
import { getTrucks } from '../queries/getTrucks'

function Landing() {
  return (
    <div className="container" style={{display: 'flex', width: '100vw', height: '100vh'}}>
      <MyTable />
    </div>
  );
}

export default Landing;

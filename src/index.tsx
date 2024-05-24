import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Loader from './Components/Loader';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { RecoilRoot } from 'recoil'
import RecoilNexus from 'recoil-nexus';
import 'bootstrap/dist/css/bootstrap.min.css';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);


root.render(
  <React.StrictMode>
      <RecoilRoot>
        <RecoilNexus />
        <Suspense fallback={<Loader type={'circles'} />}>
        <App />
      </Suspense>
      </RecoilRoot>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

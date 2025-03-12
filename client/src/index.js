import React from 'react';
import { Provider  } from 'react-redux';
import ReactDOM from 'react-dom/client';
import { LinearProgress } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';

import { persistor, store } from './store';
import reportWebVitals from './reportWebVitals';

import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Provider store={store}>
      <PersistGate loading={<LinearProgress />} persistor={persistor}>
        <React.StrictMode>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </React.StrictMode>
      </PersistGate>
    </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
setTimeout(() => {
  reportWebVitals();
}, 1000);

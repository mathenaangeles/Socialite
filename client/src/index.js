import React from 'react';
import { Provider  } from 'react-redux';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import {  ThemeProvider, CssBaseline, LinearProgress } from '@mui/material';

import { persistor, store } from './store';
import reportWebVitals from './reportWebVitals';

import App from './App';
import theme from './theme';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <PersistGate loading={<LinearProgress />} persistor={persistor}>
      <React.StrictMode>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </React.StrictMode>
    </PersistGate>
  </Provider>
);

setTimeout(() => {
  reportWebVitals();
}, 1000);

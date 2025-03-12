import { thunk } from 'redux-thunk';
import storage from 'redux-persist/lib/storage'; 
import { persistStore, persistReducer } from 'redux-persist';
import { combineReducers, configureStore } from '@reduxjs/toolkit';

import userReducer from './slices/userSlice'; 
import organizationReducer from './slices/organizationSlice'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'],
};

const rootReducer = combineReducers({
  user: persistReducer({ ...persistConfig, key: 'user' }, userReducer),
  organization: organizationReducer,
});


export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(thunk),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

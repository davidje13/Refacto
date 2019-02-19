import React from 'react';
import { Provider } from 'react-redux';
import store from './reducers/store';
import Router from './components/Router';

export default () => (
  <Provider store={store}>
    <Router />
  </Provider>
);

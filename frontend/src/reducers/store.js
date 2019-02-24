import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';
import retroList from './retroList';
import activeRetro from './activeRetro';
import time from './time';

export default createStore(
  combineReducers({
    retroList,
    activeRetro,
    time,
  }),
  applyMiddleware(thunk),
);

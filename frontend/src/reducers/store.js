import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';
import retroList from './retroList';
import retros from './retros';
import { retroMiddleware } from './retro';
import time from './time';
import view from './view';

export default createStore(
  combineReducers({
    retroList,
    retros,
    time,
    view,
  }),
  applyMiddleware(thunk, retroMiddleware),
);

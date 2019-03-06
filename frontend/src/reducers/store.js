import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';
import retroList from './retroList';
import activeRetro from './activeRetro';
import currentArchive from './currentArchive';
import time from './time';
import view from './view';

export default createStore(
  combineReducers({
    retroList,
    activeRetro,
    currentArchive,
    time,
    view,
  }),
  applyMiddleware(thunk),
);

import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';
import retroList from './retroList';
import activeRetro from './activeRetro';

export default createStore(
  combineReducers({
    retroList,
    activeRetro,
  }),
  applyMiddleware(thunk),
);

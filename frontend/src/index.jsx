import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from './reducers/store';
import { setLocalDateProvider } from './reducers/time';
import localDateTracker from './time/localDateTracker';
import App from './components/App';
import './index.css';

localDateTracker((localDateProvider) => {
  store.dispatch(setLocalDateProvider(localDateProvider));
});

ReactDOM.render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>,
  document.getElementById('root'),
);

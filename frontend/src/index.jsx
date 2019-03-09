import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import store from './reducers/store';
import { setLocalDateProvider } from './reducers/time';
import { setWindowSize } from './reducers/view';
import localDateTracker from './time/localDateTracker';
import App from './components/App';
import './index.less';

localDateTracker((localDateProvider) => {
  store.dispatch(setLocalDateProvider(localDateProvider));
});

function updateWindowSize() {
  store.dispatch(setWindowSize(window.innerWidth, window.innerHeight));
}

window.addEventListener('resize', updateWindowSize, { passive: true });
updateWindowSize();

ReactDOM.render(
  <HelmetProvider>
    <Provider store={store}>
      <BrowserRouter>
        <React.StrictMode>
          <App />
        </React.StrictMode>
      </BrowserRouter>
    </Provider>
  </HelmetProvider>,
  document.getElementById('root'),
);

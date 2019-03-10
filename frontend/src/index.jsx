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

// https://github.com/facebook/react/issues/12906
if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line no-console
  console.info('React.StrictMode is enabled; some lifecycle methods including constructors and render will be double-invoked to check for side-effects');
}

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

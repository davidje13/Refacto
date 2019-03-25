import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './components/App';
import './index.less';

// https://github.com/facebook/react/issues/12906
if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line no-console
  console.info('React.StrictMode is enabled; some lifecycle methods including constructors and render will be double-invoked to check for side-effects');
}

ReactDOM.render(
  <HelmetProvider>
    <BrowserRouter>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </BrowserRouter>
  </HelmetProvider>,
  document.getElementById('root'),
);

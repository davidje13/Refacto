import React from 'react';
import Modal from 'react-modal';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './components/App';
import { configService } from './api/api';
import './index.less';

// https://github.com/facebook/react/issues/16061
if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line no-console
  console.info('React.StrictMode is enabled; some lifecycle methods including constructors and render will be double-invoked to check for side-effects');
}

const root = document.getElementById('root');
Modal.setAppElement(root);

configService.load().then(() => {
  ReactDOM.render(
    <HelmetProvider>
      <BrowserRouter>
        <React.StrictMode>
          <App />
        </React.StrictMode>
      </BrowserRouter>
    </HelmetProvider>,
    root,
  );
});

import React, { StrictMode } from 'react';
import Modal from 'react-modal';
import ReactDOM from 'react-dom';
import { configService } from './api/api';

import './index.less';
import './preload.less';
import App from './components/App';

// https://github.com/facebook/react/issues/16061
if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line no-console
  console.info('React.StrictMode is enabled; some lifecycle methods including constructors and render will be double-invoked to check for side-effects');
}

const root = document.getElementById('root')!;
Modal.setAppElement(root);

configService.load().then(() => {
  ReactDOM.render(<StrictMode><App /></StrictMode>, root);
});

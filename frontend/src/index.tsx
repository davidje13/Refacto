import { StrictMode } from 'react';
import Modal from 'react-modal';
import { createRoot } from 'react-dom/client';
import { configService } from './api/api';
import { App } from './components/App';

import './index.less';
import './preload.less';

// https://github.com/facebook/react/issues/16061
if (process.env['NODE_ENV'] === 'development') {
  console.info(
    'React.StrictMode is enabled; some lifecycle methods including constructors and render will be double-invoked to check for side-effects',
  );
}

if (navigator.userAgent === 'HeadlessEndToEndTest') {
  document.body.classList.add('headless');
}

const root = document.getElementById('root')!;
Modal.setAppElement(root);

configService
  .load()
  .then(() => {
    createRoot(root).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  })
  .catch((e) => {
    root.innerText = 'Failed to load. Please try again later.';
    console.error('Failed to load config', e);
  });

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { configService } from './api/api';
import { App } from './components/App';
import { ConfigProvider } from './hooks/data/useConfig';

import './index.css';
import './preload.css';

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

configService
  .get()
  .then((config) => {
    createRoot(root).render(
      <StrictMode>
        <ConfigProvider value={config}>
          <App />
        </ConfigProvider>
      </StrictMode>,
    );
  })
  .catch((e) => {
    root.innerText = 'Failed to load. Please try again later.';
    console.error('Failed to load config', e);
  });

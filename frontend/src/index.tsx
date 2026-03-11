import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { configService, diagnosticsService } from './api/api';
import { App } from './components/App';
import { ConfigProvider } from './hooks/data/useConfig';

import './index.css';
import './preload.css';

window.addEventListener('error', (e) => {
  diagnosticsService.error(
    `uncaught error at ${e.filename}:${e.lineno}:${e.colno}`,
    e.error,
  );
  e.preventDefault();
});

window.addEventListener('unhandledrejection', (e) => {
  diagnosticsService.error('unhandled rejection', e.reason);
  e.preventDefault();
});

// https://github.com/facebook/react/issues/16061
if (process.env['NODE_ENV'] === 'development') {
  diagnosticsService.info(
    'React.StrictMode is enabled; some lifecycle methods including constructors and render will be double-invoked to check for side-effects',
  );
}

if (navigator.userAgent === 'HeadlessEndToEndTest') {
  document.body.classList.add('headless');
}

configService
  .get()
  .then((config) => {
    const root = document.createElement('div');
    document.getElementById('pre-load')?.remove();
    document.body.append(root);
    createRoot(root).render(
      <StrictMode>
        <ConfigProvider value={config}>
          <App />
        </ConfigProvider>
      </StrictMode>,
    );
  })
  .catch((e) => {
    diagnosticsService.error('failed to load config', e);
    document
      .getElementById('pre-load')
      ?.replaceChildren('Failed to load. Please try again later.');
  });

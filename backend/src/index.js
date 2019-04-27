import http from 'http';
import appFactory from './app';
import config from './config';

// This file exists mainly to enable hot module replacement.
// app.js is the main entry point for the application.
// (changes to index.js will not trigger HMR)

let activeApp = null;
const server = http.createServer();

let latestNonce = {};
async function refreshApp() {
  const currentNonce = {};
  latestNonce = currentNonce;
  const newApp = await appFactory(config); // app import updated by HMR magic

  if (latestNonce === currentNonce) {
    if (activeApp) {
      activeApp.detach(server);
    }
    activeApp = newApp;
    activeApp.attach(server);
  }
}

if (module.hot) {
  // Enable webpack-managed hot reloading of backend sources during development
  module.hot.accept(['./app', './config'], refreshApp);
}

const { port, mock: { ssoPort } } = config;

if (ssoPort) {
  // Dev mode: run an additional mock SSO server
  import('./mock-sso/sso')
    .then(({ default: ssoApp }) => ssoApp.listen(ssoPort))
    .catch(() => {
      process.stderr.write('Failed to start mock SSO server\n');
    });
}

refreshApp().then(() => server.listen(port, () => {
  process.stdout.write(`Available at http://localhost:${port}/\n`);
  process.stdout.write('Press Ctrl+C to stop\n');
}));

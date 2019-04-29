import http from 'http';
import appFactory from './app';
import config from './config';

// This file exists mainly to enable hot module replacement.
// app.js is the main entry point for the application.
// (changes to index.js will not trigger HMR)

let activeApp = null;
const server = http.createServer();

function startServer() {
  server.listen(config.port, () => {
    process.stdout.write(`Available at http://localhost:${config.port}/\n`);
    process.stdout.write('Press Ctrl+C to stop\n');
  });
}

let latestNonce = {};
async function refreshApp() {
  const currentNonce = {};
  latestNonce = currentNonce;
  try {
    const newApp = await appFactory(config); // app import updated by HMR magic

    if (latestNonce === currentNonce) {
      if (activeApp) {
        activeApp.detach(server);
      } else {
        startServer();
      }
      activeApp = newApp;
      activeApp.attach(server);
    }
  } catch (e) {
    process.stderr.write('Failed to start server\n');
    process.stderr.write(`${e.message}\n`);
    process.exit(1);
  }
}

if (module.hot) {
  // Enable webpack-managed hot reloading of backend sources during development
  module.hot.accept(['./app', './config'], refreshApp);
}

if (config.mock.ssoPort) {
  // Dev mode: run an additional mock SSO server
  import('./mock-sso/sso')
    .then(({ default: ssoApp }) => ssoApp.listen(config.mock.ssoPort))
    .catch(() => {
      process.stderr.write('Failed to start mock SSO server\n');
    });
}

refreshApp();

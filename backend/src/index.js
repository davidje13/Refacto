import http from 'http';
import app from './app';

const port = process.env.PORT || 5000;

let activeApp = null;
const server = http.createServer();

function refreshApp() {
  if (activeApp) {
    server.removeListener('request', activeApp);
  }
  activeApp = app; // app import updated by HMR magic
  server.on('request', activeApp);
}

refreshApp();

if (module.hot) {
  // Enable webpack-managed hot reloading of backend sources during development
  module.hot.accept('./app', refreshApp);
}

server.listen(port, () => {
  process.stdout.write(`Available at http://localhost:${port}/\n`);
  process.stdout.write('Press Ctrl+C to stop\n');
});

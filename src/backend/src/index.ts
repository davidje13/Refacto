import http from 'http';
import util from 'util';
import type WebSocketExpress from 'websocket-express';
import { buildMockSsoApp } from 'authentication-backend';
import appFactory from './app';
import config from './config';

// This file exists mainly to enable hot module replacement.
// app.js is the main entry point for the application.
// (changes to index.js will not trigger HMR)

let activeApp: WebSocketExpress | null = null;
const server = http.createServer();

function startServer(): void {
  server.listen(config.port, config.serverBindAddress, () => {
    process.stdout.write(`Available at http://localhost:${config.port}/\n`);
    process.stdout.write('Press Ctrl+C to stop\n');
  });
}

let latestNonce = {};
async function refreshApp(): Promise<void> {
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

let mockSsoServer: http.Server | undefined;

if (config.mockSsoPort) {
  // Dev mode: run an additional mock SSO server
  try {
    mockSsoServer = buildMockSsoApp().listen(
      config.mockSsoPort,
      config.serverBindAddress,
    );
  } catch (e) {
    process.stderr.write('Failed to start mock SSO server\n');
  }
}

function getConnectionCount(s: http.Server): Promise<number> {
  return util.promisify(s.getConnections.bind(s))();
}

async function shutdown(): Promise<void> {
  const scCount = await getConnectionCount(server);
  process.stdout.write(`Shutting down (open connections: ${scCount})\n`);

  if (mockSsoServer) {
    const mscCount = await getConnectionCount(mockSsoServer);
    process.stdout.write(`Shutting down mock SSO server (open connections: ${mscCount})\n`);
  }

  await Promise.all([
    util.promisify(server.close.bind(server))(),
    mockSsoServer ? util.promisify(mockSsoServer.close.bind(mockSsoServer))() : undefined,
  ]);

  process.stdout.write('Shutdown complete\n');
}

let interrupted = false;
process.on('SIGINT', () => {
  // SIGINT is sent twice in quick succession, so ignore the second
  if (!interrupted) {
    interrupted = true;
    process.stdout.write('\n');
    shutdown().catch((e) => {
      process.stderr.write(`Failed to shutdown server: ${e}\n`);
    });
  }
});

void refreshApp();

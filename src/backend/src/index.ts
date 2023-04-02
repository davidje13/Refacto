import http from 'node:http';
import { promisify } from 'node:util';
import { buildMockSsoApp } from 'authentication-backend';
import { appFactory, App } from './app';
import { config } from './config';

// This file exists mainly to enable hot module replacement.
// app.js is the main entry point for the application.
// (changes to index.js will not trigger HMR)

let activeApp: App | null = null;
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
      const oldApp = activeApp;
      if (oldApp) {
        oldApp.express.detach(server);
      } else {
        startServer();
      }
      activeApp = newApp;
      activeApp.express.attach(server);
      if (oldApp) {
        await oldApp.close();
      }
    }
  } catch (e: unknown) {
    process.stderr.write('Failed to start server\n');
    if (e instanceof Error) {
      process.stderr.write(`${e.message}\n`);
    } else {
      process.stderr.write(`${e}\n`);
    }
    process.exit(1);
  }
}

//if (module.hot) { // TODO
//  // Enable webpack-managed hot reloading of backend sources during development
//  module.hot.accept(['./app', './config'], refreshApp);
//}

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
  return promisify(s.getConnections.bind(s))();
}

async function shutdown(): Promise<void> {
  const scCount = await getConnectionCount(server);
  process.stdout.write(`Shutting down (open connections: ${scCount})\n`);

  if (mockSsoServer) {
    const mscCount = await getConnectionCount(mockSsoServer);
    process.stdout.write(`Shutting down mock SSO server (open connections: ${mscCount})\n`);
  }

  await Promise.all([
    promisify(server.close.bind(server))(),
    mockSsoServer ? promisify(mockSsoServer.close.bind(mockSsoServer))() : undefined,
  ]);
  await activeApp?.close();

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

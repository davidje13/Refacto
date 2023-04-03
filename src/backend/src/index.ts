import { createServer, type Server } from 'node:http';
import { promisify } from 'node:util';
import { buildMockSsoApp } from 'authentication-backend';
import { appFactory, type App } from './app';
import { type ConfigT, config } from './config';

// This file exists mainly to enable hot module replacement.
// app.js is the main entry point for the application.
// (changes to index.js will not trigger HMR)

let activeApp: App | null = null;
const server = createServer();

function startServer(): void {
  server.listen(config.port, config.serverBindAddress, () => {
    process.stdout.write(`Available at http://localhost:${config.port}/\n`);
    process.stdout.write('Press Ctrl+C to stop\n');
  });
}

let latestNonce = {};
async function refreshApp(
  af: (config: ConfigT) => Promise<App>,
  conf: ConfigT,
) {
  const currentNonce = {};
  latestNonce = currentNonce;
  try {
    const newApp = await af(conf);

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
  } catch (e) {
    process.stderr.write('Failed to start server\n');
    if (e instanceof Error) {
      process.stderr.write(`${e.message}\n`);
    } else {
      process.stderr.write(`${e}\n`);
    }
    process.exit(1);
  }
}

//if (import.meta.hot) { // TODO
//  // Enable hot reloading of backend sources during development
//  import.meta.hot.accept(['./app', './config'], ([newApp, newConfig]) => refreshApp(newApp.appFactory, newConfig.config));
//}

let mockSsoServer: Server | undefined;

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

function getConnectionCount(s: Server): Promise<number> {
  return promisify(s.getConnections.bind(s))();
}

async function shutdown(): Promise<void> {
  const scCount = await getConnectionCount(server);
  process.stdout.write(`Shutting down (open connections: ${scCount})\n`);

  if (mockSsoServer) {
    const mscCount = await getConnectionCount(mockSsoServer);
    process.stdout.write(
      `Shutting down mock SSO server (open connections: ${mscCount})\n`,
    );
  }

  await Promise.all([
    promisify(server.close.bind(server))(),
    mockSsoServer
      ? promisify(mockSsoServer.close.bind(mockSsoServer))()
      : undefined,
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

void refreshApp(appFactory, config);

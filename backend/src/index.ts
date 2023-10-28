import { createServer, type Server } from 'node:http';
import { promisify } from 'node:util';
import { buildMockSsoApp } from 'authentication-backend';
import { appFactory, type App } from './app';
import { type ConfigT, config } from './config';
import { logError, logInfo } from './log';

// This file exists mainly to enable hot module replacement.
// app.ts is the main entry point for the application.
// (changes to index.ts will not trigger HMR)

let activeApp: App | null = null;
const server = createServer();

function startServer(): void {
  server.listen(config.port, config.serverBindAddress, () => {
    logInfo(`Available at http://localhost:${config.port}/`);
    logInfo('Press Ctrl+C to stop');
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
    logError('Failed to start server', e);
    process.exit(1);
  }
}

// TODO: find a HMR plugin for rollup (see https://github.com/rollup/rollup/issues/50)
//if (import.meta.hot) {
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
    logError('Failed to start mock SSO server', e);
  }
}

function getConnectionCount(s: Server): Promise<number> {
  return promisify(s.getConnections.bind(s))();
}

async function shutdown(): Promise<void> {
  const scCount = await getConnectionCount(server);
  logInfo(`Shutting down (open connections: ${scCount})`);

  if (mockSsoServer) {
    const mscCount = await getConnectionCount(mockSsoServer);
    logInfo(`Shutting down mock SSO server (open connections: ${mscCount})`);
  }

  await Promise.all([
    promisify(server.close.bind(server))(),
    mockSsoServer
      ? promisify(mockSsoServer.close.bind(mockSsoServer))()
      : undefined,
  ]);
  await activeApp?.close();

  logInfo('Shutdown complete');
}

let interrupted = false;
process.on('SIGINT', () => {
  // SIGINT is sent twice in quick succession, so ignore the second
  if (!interrupted) {
    interrupted = true;
    logInfo('');
    shutdown().catch((e) => {
      logError('Failed to shutdown server', e);
    });
  }
});

void refreshApp(appFactory, config);

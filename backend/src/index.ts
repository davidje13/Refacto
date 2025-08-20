import { createServer, type Server } from 'node:http';
import { promisify } from 'node:util';
import { buildMockSsoApp } from 'authentication-backend';
import { appFactory } from './app';
import { config } from './config';

// https://nodejs.org/en/learn/getting-started/security-best-practices#dns-rebinding-cwe-346
process.on('SIGUSR1', () => {
  // ignore (disable default behaviour of opening inspector port)
});

// Temporary polyfill for Node 18 support
if (!(global as any).CustomEvent) {
  logInfo('Polyfilling CustomEvent');
  (global as any).CustomEvent = class CustomEvent extends Event {
    public readonly detail: unknown;

    constructor(
      type: string,
      options: {
        bubbles?: boolean;
        cancelable?: boolean;
        composed?: boolean;
        detail?: unknown;
      },
    ) {
      super(type, options);
      this.detail = options?.detail ?? null;
    }
  };
}

// https://nodejs.org/en/learn/getting-started/security-best-practices#prototype-pollution-attacks-cwe-1321
// TODO: https://github.com/nodejs/undici/issues/4009
//Object.freeze(globalThis);

type MaybePromise<T> = T | Promise<T>;
const tasks: { name: string; run: () => MaybePromise<void> }[] = [];
const shutdownTasks: (() => MaybePromise<void>)[] = [];

tasks.push({
  name: 'server',
  run: async () => {
    const server = createServer();
    const app = await appFactory(config);

    shutdownTasks.push(async () => {
      const scCount = await getConnectionCount(server);
      logInfo(`Shutting down (open connections: ${scCount})`);

      await app.softClose(1000);
      await promisify(server.close.bind(server))();
      await app.close();
    });

    app.express.attach(server);
    await new Promise<void>((resolve) =>
      server.listen(config.port, config.serverBindAddress, resolve),
    );
    logInfo(`Available at http://localhost:${config.port}/`);
  },
});

if (config.mockSsoPort) {
  // Dev mode: run an additional mock SSO server
  tasks.push({
    name: 'mock SSO server',
    run: () => {
      const mockSsoServer = buildMockSsoApp().listen(
        config.mockSsoPort,
        config.serverBindAddress,
      );
      shutdownTasks.push(async () => {
        const mscCount = await getConnectionCount(mockSsoServer);
        logInfo(
          `Shutting down mock SSO server (open connections: ${mscCount})`,
        );
        await promisify(mockSsoServer.close.bind(mockSsoServer))();
      });
    },
  });
}

function getConnectionCount(s: Server): Promise<number> {
  return promisify(s.getConnections.bind(s))();
}

let interrupted = false;
process.on('SIGINT', async () => {
  // SIGINT is sent twice in quick succession, so ignore the second
  if (!interrupted) {
    interrupted = true;
    logInfo('');
    try {
      await Promise.all(shutdownTasks.map((fn) => fn()));
      logInfo('Shutdown complete');
    } catch (e) {
      logError('Failed to shutdown server', e);
    }
  }
});

(async () => {
  let success = true;
  await Promise.all(
    tasks.map(async ({ name, run }) => {
      try {
        await run();
      } catch (e) {
        success = false;
        logError(`Failed to start ${name}`, e);
      }
    }),
  );
  if (success) {
    logInfo('Press Ctrl+C to stop');
  } else {
    // process.exit may lose stream data which has been buffered in NodeJS - wait for it all to be flushed before exiting
    await Promise.all([
      new Promise((resolve) => process.stdout.write('', resolve)),
      new Promise((resolve) => process.stderr.write('', resolve)),
    ]);
    process.exit(1);
  }
})();

function logInfo(message: string) {
  process.stderr.write(`${message}\n`);
}

function logError(message: string, err: unknown) {
  if (err instanceof Error) {
    process.stderr.write(`${message}: ${err.message}\n`);
  } else {
    process.stderr.write(`${message}: ${err}\n`);
  }
}

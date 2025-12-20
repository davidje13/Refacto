import type { Server } from 'node:http';
import { promisify } from 'node:util';
import { buildMockSSO } from 'authentication-backend/mock';
import { LogService } from './services/LogService';
import { appFactory } from './app';
import { config } from './config';

// https://nodejs.org/en/learn/getting-started/security-best-practices#dns-rebinding-cwe-346
process.on('SIGUSR1', () => {
  // ignore (disable default behaviour of opening inspector port)
});

// https://nodejs.org/en/learn/getting-started/security-best-practices#prototype-pollution-attacks-cwe-1321
// TODO: https://github.com/nodejs/undici/issues/4009
//Object.freeze(globalThis);

const logService = new LogService(config.log.file);

// for log rotation: after renaming the old log file, send a SIGHUP to direct output to the new file
process.on('SIGHUP', () => logService.reopen());

type MaybePromise<T> = T | Promise<T>;
const tasks: { name: string; run: () => MaybePromise<void> }[] = [];
const shutdownTasks: (() => MaybePromise<void>)[] = [];

tasks.push({
  name: 'server',
  run: async () => {
    const app = await appFactory(logService, config);
    const server = app.listener.createServer();

    shutdownTasks.push(async () => {
      const scCount = await getConnectionCount(server);
      logService.log({ event: 'shutdown', openConnections: scCount });
      printInfo(`Shutting down (open connections: ${scCount})`);

      await server.closeWithTimeout('shutdown', 2000);
      await app.close();
    });

    await new Promise<void>((resolve) =>
      server.listen(config.port, config.serverBindAddress, resolve),
    );
    logService.log({ event: 'startup' });
    printInfo(
      `Available at http://localhost:${config.port}/, logging to ${config.log.file}`,
    );
  },
});

if (config.mockSsoPort) {
  // Dev mode: run an additional mock SSO server
  tasks.push({
    name: 'mock SSO server',
    run: () => {
      const mockSsoServer = buildMockSSO().listen(
        config.mockSsoPort,
        config.serverBindAddress,
      );
      shutdownTasks.push(async () => {
        const mscCount = await getConnectionCount(mockSsoServer);
        printInfo(
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
const shutdown = async () => {
  if (interrupted) {
    return;
  }
  interrupted = true;
  printInfo('');
  try {
    await Promise.all(shutdownTasks.map((fn) => fn()));
    await logService.close();
    printInfo('Shutdown complete');
  } catch (e) {
    printError('Failed to shutdown server', e);
  }
};
process.on('SIGINT', shutdown); // respond to Ctrl+C from terminal
process.on('SIGTERM', shutdown); // e.g. sent by Docker when container is stopped

(async () => {
  let success = true;
  await Promise.all(
    tasks.map(async ({ name, run }) => {
      try {
        await run();
      } catch (e) {
        success = false;
        printError(`Failed to start ${name}`, e);
      }
    }),
  );
  if (success) {
    printInfo('Press Ctrl+C to stop');
  } else {
    // process.exit may lose stream data which has been buffered in NodeJS - wait for it all to be flushed before exiting
    await Promise.all([
      logService.close(),
      new Promise((resolve) => process.stdout.write('', resolve)),
      new Promise((resolve) => process.stderr.write('', resolve)),
    ]);
    process.exit(1);
  }
})();

// These helpers output to stderr, not the log file

function printInfo(message: string) {
  process.stderr.write(`${message}\n`);
}

function printError(message: string, err: unknown) {
  if (err instanceof Error) {
    process.stderr.write(`${message}: ${err.message}\n`);
  } else {
    process.stderr.write(`${message}: ${err}\n`);
  }
}

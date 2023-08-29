import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { TypedParameter } from 'lean-test';
import { App } from '../app';

type Runnable = Server | App;
type MaybePromise<T> = T | Promise<T>;

export function addressToString(addr: AddressInfo | string | null): string {
  if (!addr) {
    throw new Error('Test server is not running');
  }
  if (typeof addr === 'string') {
    return addr;
  }
  const { address, family, port } = addr;
  const host = family === 'IPv6' ? `[${address}]` : address;
  return `http://${host}:${port}`;
}

export const testServerRunner = <T extends { run: Runnable }>(
  serverFn: (getTyped: <T>(key: TypedParameter<T>) => T) => MaybePromise<T>,
) =>
  beforeEach<{ server: Server } & Omit<T, 'run'>>(
    async ({ setParameter, getTyped }) => {
      let server: Server;
      const { run, ...extras } = await serverFn(getTyped);
      if (run instanceof App) {
        server = run.express.createServer();
      } else {
        server = run;
      }
      setParameter({ ...extras, server });
      await new Promise<void>((resolve) =>
        server.listen(0, 'localhost', resolve),
      );

      return async () => {
        await new Promise((resolve) => server.close(resolve));
        if (run instanceof App) {
          await run.close();
        }
      };
    },
  );

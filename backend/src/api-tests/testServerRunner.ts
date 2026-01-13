import type { Server } from 'node:http';
import { type WebListener } from 'web-listener';
import type { TypedParameter } from 'lean-test';
import { App, type TestHooks } from '../app';
import type { TestLogger } from './TestLogger';

type Runnable = WebListener | App;
type MaybePromise<T> = T | Promise<T>;

export const testServerRunner = <
  T extends { run: Runnable; logger?: TestLogger },
>(
  serverFn: (getTyped: <T>(key: TypedParameter<T>) => T) => MaybePromise<T>,
) =>
  beforeEach<{ server: Server } & Omit<T, 'run'>>(
    async ({ setParameter, getTyped }) => {
      const { run, ...extras } = await serverFn(getTyped);
      const listener = run instanceof App ? run.listener : run;
      const server = await listener.listen(0, '127.0.0.1');
      setParameter({ ...extras, server });

      return async () => {
        await server.closeWithTimeout('end of test', 0);
        if (run instanceof App) {
          await run.close();
        }
        for (const log of extras.logger?.logs ?? []) {
          console.log(log);
        }
      };
    },
  );

export const testSimpleServerRunner = (serverFn: () => Server) =>
  beforeEach<Server>(async ({ setParameter }) => {
    const server = serverFn();
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    setParameter(server);

    return () => {
      server.close();
      server.closeAllConnections();
    };
  });

export function getUserToken(
  { userAuthService }: TestHooks,
  userId: string,
): string {
  return userAuthService.grantToken({
    aud: 'user',
    iss: 'test',
    sub: userId,
  });
}

export async function getRetroToken(
  { retroAuthService }: TestHooks,
  retroId: string,
  scopes = {},
): Promise<string | null> {
  const grant = await retroAuthService.grantToken(retroId, {
    read: true,
    readArchives: true,
    write: true,
    manage: true,
    ...scopes,
  });
  return grant?.token ?? null;
}

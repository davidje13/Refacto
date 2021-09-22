import type { Server } from 'http';
import type { AddressInfo } from 'net';
import { App } from '../app';

type Runnable = Server | App;

export function addressToString(addr: AddressInfo | string): string {
  if (typeof addr === 'string') {
    return addr;
  }
  const { address, family, port } = addr;
  const host = (family === 'IPv6') ? `[${address}]` : address;
  return `http://${host}:${port}`;
}

export default (
  serverFn: () => (Runnable | Promise<Runnable>),
): Server => {
  let server: Server | null;
  let close: (() => void | Promise<void>) | null;

  beforeEach((done) => {
    server = null;
    Promise.resolve(serverFn())
      .then((rawServer) => {
        if (rawServer instanceof App) {
          close = rawServer.close;
          server = rawServer.express.createServer();
        } else {
          server = rawServer;
        }
        server.listen(0, 'localhost', done);
      })
      .catch((e) => done.fail(e));
  });

  afterEach((done) => {
    if (server) {
      const tempServer = server;
      server = null;
      tempServer.close(() => (close?.() ?? Promise.resolve()).then(done));
    } else {
      done();
    }
  });

  return new Proxy({}, {
    get: (o, prop: keyof Server): unknown => server![prop],
  }) as Readonly<Server>;
};

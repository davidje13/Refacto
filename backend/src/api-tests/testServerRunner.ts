import { Server } from 'http';
import { AddressInfo } from 'net';
import WebSocketExpress from 'websocket-express';

type Runnable = Server | WebSocketExpress;

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

  beforeEach((done): void => {
    server = null;
    Promise.resolve(serverFn())
      .then((rawServer): void => {
        server = rawServer.listen(0, 'localhost', done);
      })
      .catch((e): void => done.fail(e));
  });

  afterEach((done): void => {
    if (server) {
      const tempServer = server;
      server = null;
      tempServer.close(done);
    } else {
      done();
    }
  });

  return new Proxy({}, {
    get: (o, prop: keyof Server): any => server![prop],
  }) as Readonly<Server>;
};

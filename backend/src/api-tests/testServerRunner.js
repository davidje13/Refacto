export default (serverFn) => {
  let server;

  beforeEach(async () => {
    server = await serverFn();
    if (server.createServer) {
      server = server.createServer();
    }
  });

  beforeEach((done) => {
    if (server) {
      server.listen(0, done);
    } else {
      done();
    }
  });

  afterEach((done) => {
    if (server) {
      const tempServer = server;
      server = null;
      tempServer.close(done);
    } else {
      done();
    }
  });

  return new Proxy({}, {
    get: (o, prop) => server[prop],
  });
};

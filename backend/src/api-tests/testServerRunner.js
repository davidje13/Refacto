export default (serverFn) => {
  let server;

  beforeEach(async () => {
    server = await serverFn();
    if (server.createServer) {
      server = server.createServer();
    }
  });

  beforeEach((done) => {
    server.listen(0, done);
  });

  afterEach((done) => {
    const tempServer = server;
    server = null;
    tempServer.close(done);
  });

  return new Proxy({}, {
    get: (o, prop) => server[prop],
  });
};

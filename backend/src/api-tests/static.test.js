import WebSocketExpress from 'websocket-express';
import request from 'superwstest';
import appFactory from '../app';

function addressToString(addr) {
  if (typeof addr === 'string') {
    return addr;
  }
  const { address, family, port } = addr;
  const host = (family === 'IPv6') ? `[${address}]` : address;
  return `http://${host}:${port}`;
}

describe('API static content', () => {
  const baseConfig = {
    password: {},
    token: {},
    db: {
      url: 'memory://',
    },
    sso: {},
  };

  describe('Embedded', () => {
    let server;

    beforeEach((done) => {
      appFactory(baseConfig).then((app) => {
        server = app.createServer();
        server.listen(0, done);
      });
    });

    afterEach((done) => {
      server.close(done);
    });

    it('responds with index.html for root requests', async () => {
      const response = await request(server)
        .get('/')
        .expect(200)
        .expect('Content-Type', /text\/html/);

      expect(response.text).toContain('<title>Example Static Resource</title>');
    });

    it('responds with index.html for all unknown requests', async () => {
      const response = await request(server)
        .get('/foobar')
        .expect(200)
        .expect('Content-Type', /text\/html/);

      expect(response.text).toContain('<title>Example Static Resource</title>');
    });
  });

  describe('Proxy', () => {
    let proxyServer;
    let server;

    beforeEach((done) => {
      const proxyApp = new WebSocketExpress();
      proxyApp.get('/', (req, res) => {
        res.send('proxied content here');
      });
      proxyServer = proxyApp.createServer();
      proxyServer.listen(0, done);
    });

    beforeEach((done) => {
      const forwardHost = addressToString(proxyServer.address());
      const config = Object.assign({ forwardHost }, baseConfig);
      appFactory(config).then((app) => {
        server = app.createServer();
        server.listen(0, done);
      });
    });

    afterEach((done) => {
      server.close(done);
    });

    afterEach((done) => {
      proxyServer.close(done);
    });

    it('proxies unknown requests to the configured address', async () => {
      const response = await request(server)
        .get('/')
        .expect(200);

      expect(response.text).toContain('proxied content here');
    });
  });
});

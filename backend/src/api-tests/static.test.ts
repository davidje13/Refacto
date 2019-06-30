import WebSocketExpress from 'websocket-express';
import request from 'superwstest';
import testConfig from './testConfig';
import testServerRunner, { addressToString } from './testServerRunner';
import appFactory from '../app';

describe('API static content', () => {
  describe('Embedded', () => {
    const server = testServerRunner(() => appFactory(testConfig()));

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
    const proxyServer = testServerRunner(() => {
      const proxyApp = new WebSocketExpress();
      proxyApp.get('/', (req, res) => {
        res.send('proxied content here');
      });
      return proxyApp.createServer();
    });

    const server = testServerRunner(() => appFactory(testConfig({
      forwardHost: addressToString(proxyServer.address()!),
    })));

    it('proxies unknown requests to the configured address', async () => {
      const response = await request(server)
        .get('/')
        .expect(200);

      expect(response.text).toContain('proxied content here');
    });
  });
});

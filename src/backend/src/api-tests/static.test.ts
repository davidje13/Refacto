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
        .expect('Content-Type', /text\/html/)
        .expect('Vary', 'Accept-Encoding');

      expect(response.text).toContain('<title>Example Static Resource</title>');
    });

    it('responds with requested file for known requests', async () => {
      const response = await request(server)
        .get('/example.abc123.js')
        .expect(200)
        .expect('Content-Type', /application\/javascript/);

      expect(response.text).toContain('// Example Versioned Resource');
    });

    it('responds with gzipped files if available', async () => {
      const response = await request(server)
        .get('/index-compressed.html')
        .set('Accept-Encoding', 'gzip')
        .expect(200)
        .expect('Content-Type', /text\/html/)
        .expect('Content-Encoding', 'gzip')
        .expect('Vary', 'Accept-Encoding');

      expect(response.text).toContain('<title>Example Compressed Static Resource</title>');
    });

    it('responds with index.html for all unknown requests', async () => {
      const response = await request(server)
        .get('/foobar')
        .expect(200)
        .expect('Content-Type', /text\/html/)
        .expect('Vary', 'Accept-Encoding');

      expect(response.text).toContain('<title>Example Static Resource</title>');
    });

    it('responds with index.html.gz for unknown requests if available', async () => {
      const response = await request(server)
        .get('/foobar')
        .set('Accept-Encoding', 'gzip')
        .expect(200)
        .expect('Content-Type', /text\/html/)
        .expect('Content-Encoding', 'gzip')
        .expect('Vary', 'Accept-Encoding');

      expect(response.text).toContain('<title>Example Static Resource</title>');
    });

    it('omits Vary: Content-Type for files with no compressed version', async () => {
      const response = await request(server)
        .get('/example.abc123.js')
        .expect(200);

      const vary = response.header.vary || '';
      expect(vary).not.toContain('Content-Type');
    });

    it('adds common headers', async () => {
      await request(server)
        .get('/')
        .expect('X-Frame-Options', 'DENY');

      await request(server)
        .get('/example.abc123.js')
        .expect('X-Frame-Options', 'DENY');

      await request(server)
        .get('/foobar')
        .expect('X-Frame-Options', 'DENY');
    });

    it('manages cache control', async () => {
      await request(server)
        .get('/')
        .expect('Cache-Control', 'public, max-age=600, stale-if-error=86400')
        .expect('ETag', /.+/);

      await request(server)
        .get('/example.abc123.js')
        .expect('Cache-Control', 'public, max-age=31536000, stale-if-error=31536000, immutable')
        .expect('ETag', /.+/);

      await request(server)
        .get('/foobar')
        .expect('Cache-Control', 'public, max-age=600, stale-if-error=86400')
        .expect('ETag', /.+/);
    });

    it('does not apply within /api', async () => {
      await request(server)
        .get('/api/foo')
        .expect(404);
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

    it('adds common headers', async () => {
      await request(server)
        .get('/')
        .expect('X-Frame-Options', 'DENY');
    });

    it('does not apply within /api', async () => {
      await request(server)
        .get('/api/foo')
        .expect(404);
    });
  });
});

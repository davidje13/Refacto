import request from '../test-helpers/superwstest';
import WebSocketExpress from './WebSocketExpress';
import Router from './Router';

function sleep(millis) {
  return new Promise((resolve) => setTimeout(resolve, millis));
}

function makeTestServer() {
  const app = new WebSocketExpress();
  const router = new Router();

  router.get('/path/get', (req, res) => {
    res.end('get-output');
  });

  router.ws('/path/ws', (req, ws) => {
    ws.on('message', (msg) => {
      ws.send(`echo ${msg}`);
    });
    ws.send('hello');
  });

  router.ws('/path/reject-ws', (req, ws, next) => {
    next();
  });

  router.ws('/path/ws-async', async (req, ws) => {
    await sleep(100);
    ws.send('hello');
  });

  router.ws('/path/reject-ws-async', async (req, ws, next) => {
    await sleep(100);
    next();
  });

  app.use(router);

  return app.createServer();
}

describe('WebSocketExpress', () => {
  let server;

  beforeEach((done) => {
    server = makeTestServer();
    server.listen(0, done);
  });

  afterEach(() => {
    server.close();
  });

  describe('get', () => {
    it('returns response from handler', async () => {
      const response = await request(server)
        .get('/path/get')
        .expect(200);

      expect(response.text).toEqual('get-output');
    });

    it('does not respond to websocket connections', async () => {
      await request(server)
        .ws('/path/get')
        .expectClosed();
    });
  });

  describe('ws', () => {
    it('responds to websocket connections', async () => {
      await request(server)
        .ws('/path/ws')
        .expect('hello')
        .send('foo')
        .expect('echo foo')
        .send('abc')
        .expect('echo abc')
        .close()
        .expectClosed();
    });

    it('does not respond to HTTP requests', async () => {
      await request(server)
        .get('/path/ws')
        .expect(404);
    });

    it('does not respond to rejected connections', async () => {
      await request(server)
        .ws('/path/reject-ws')
        .expectClosed();
    });

    it('responds to asynchronously accepted connections', async () => {
      await request(server)
        .ws('/path/ws-async')
        .expect('hello')
        .close()
        .expectClosed();
    });

    it('does not respond to asynchronously rejected connections', async () => {
      await request(server)
        .ws('/path/reject-ws-async')
        .expectClosed();
    });
  });
});

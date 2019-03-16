import request from 'supertest';
import BlockingQueue from 'blocking-queue';
import WebSocket from 'ws';

function wsRequest(url) {
  const messages = new BlockingQueue();
  const errors = new BlockingQueue();
  const closed = new BlockingQueue();

  let chain = new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    // ws.on('open', () => console.log('OPEN'));
    // ws.on('error', (e) => console.log('ERROR', e));
    // ws.on('close', () => console.log('CLOSE'));
    // ws.on('message', (m) => console.log('MESSAGE', m));

    ws.on('message', (msg) => messages.push(msg));
    ws.on('error', (err) => errors.push(err));
    ws.on('error', reject);
    ws.on('close', () => closed.push());
    ws.on('open', () => {
      ws.removeListener('error', reject);
      resolve(ws);
    });
  });

  const getError = errors.pop().then((err) => {
    throw err;
  });

  const methods = {};
  function wrapPromise(promise) {
    return Object.assign({}, promise, methods);
  }

  const thenDo = (fn) => (...args) => {
    chain = chain.then(async (ws) => {
      await Promise.race([fn(ws, ...args), getError]);
      return ws;
    });
    return wrapPromise(chain);
  };

  methods.send = thenDo((ws, msg) => ws.send(msg));
  methods.expectMessage = thenDo(async (ws, msg = null) => {
    const received = await messages.pop();
    if (msg === null) {
      expect(received).not.toEqual('');
    } else if (typeof msg === 'function') {
      const result = msg(received);
      if (result !== undefined) {
        expect(result).toBe(true);
      }
    } else {
      expect(received).toEqual(msg);
    }
  });
  methods.expectJsonMessage = thenDo(async (ws, msg = null) => {
    const received = await messages.pop();
    const receivedJson = JSON.parse(received);
    if (msg === null) {
      expect(receivedJson).not.toEqual(null);
    } else if (typeof msg === 'function') {
      const result = msg(receivedJson);
      if (result !== undefined) {
        expect(result).toBe(true);
      }
    } else {
      expect(receivedJson).toEqual(msg);
    }
  });
  methods.close = thenDo((ws) => ws.close());
  methods.expectClosed = thenDo(() => closed.pop());
  methods.then = thenDo((ws, fn) => fn(ws));

  return wrapPromise(chain);
}

export default (server) => {
  const addr = server.address();
  if (!addr) {
    throw new Error(
      'Server must be listening: beforeEach((done) => server.listen(0, done));',
    );
  }

  const obj = request(server);
  obj.ws = (url) => wsRequest(`ws://127.0.0.1:${addr.port}${url}`);

  return obj;
};

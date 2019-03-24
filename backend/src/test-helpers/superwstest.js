import request, { Test } from 'supertest';
import BlockingQueue from 'blocking-queue';
import WebSocket from 'ws';

const REGEXP_HTTP = /^http/;

function getServerWsPath(server, path) {
  if (!server.address()) {
    throw new Error('Server was closed');
  }
  return Test.prototype.serverAddress(server, path).replace(REGEXP_HTTP, 'ws');
}

function msgText(data) {
  if (typeof data !== 'string') {
    throw new Error(`Expected text message, got ${typeof data}`);
  }
  return data;
}

function msgJson(data) {
  return JSON.parse(msgText(data));
}

const wsMethods = {
  send: (ws, msg) => ws.send(msg),
  sendText: (ws, msg) => ws.send(msg),
  sendJson: (ws, msg) => ws.send(JSON.stringify(msg)),
  expectMessage: async (ws, conversion, check = null) => {
    const received = await ws.messages.pop().then(conversion);
    if (check === null) {
      expect(received).not.toEqual('');
    } else if (typeof check === 'function') {
      const result = check(received);
      if (result !== undefined) {
        expect(result).toBe(true);
      }
    } else {
      expect(received).toEqual(check);
    }
  },
  expectText: (ws, check) => wsMethods.expectMessage(ws, msgText, check),
  expectJson: (ws, check) => wsMethods.expectMessage(ws, msgJson, check),
  close: (ws) => ws.close(),
  expectClosed: (ws) => ws.closed.pop(),
  then: (ws, fn) => fn(ws),
};

function wsRequest(url) {
  let chain = new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    // ws.on('open', () => console.log('OPEN'));
    // ws.on('error', (e) => console.log('ERROR', e));
    // ws.on('close', () => console.log('CLOSE'));
    // ws.on('message', (m) => console.log('MESSAGE', m));

    ws.messages = new BlockingQueue();
    ws.errors = new BlockingQueue();
    ws.closed = new BlockingQueue();
    ws.firstError = ws.errors.pop();

    ws.on('message', (msg) => ws.messages.push(msg));
    ws.on('error', (err) => ws.errors.push(err));
    ws.on('error', reject);
    ws.on('close', () => ws.closed.push());
    ws.on('open', () => {
      ws.removeListener('error', reject);
      resolve(ws);
    });
  });

  const methods = {};
  function wrapPromise(promise) {
    return Object.assign({}, promise, methods);
  }

  const thenDo = (fn) => (...args) => {
    chain = chain.then(async (ws) => {
      const o = await Promise.race([fn(ws, ...args), ws.firstError]);
      if (o instanceof Error) {
        throw o;
      }
      return ws;
    });
    return wrapPromise(chain);
  };

  Object.keys(wsMethods).forEach((method) => {
    methods[method] = thenDo(wsMethods[method]);
  });

  return wrapPromise(chain);
}

export default (server) => {
  if (!server.address()) {
    // see https://github.com/visionmedia/supertest/issues/566
    throw new Error(
      'Server must be listening: beforeEach((done) => server.listen(0, done));',
    );
  }

  const obj = request(server);
  obj.ws = (path) => wsRequest(getServerWsPath(server, path));

  return obj;
};

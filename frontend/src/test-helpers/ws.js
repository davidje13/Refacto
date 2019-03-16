import BlockingQueue from 'blocking-queue';

class MockWebSocketClient {
  static expectations = [];

  static expect(url, scriptFn) {
    MockWebSocketClient.expectations.push({ url, scriptFn });
  }

  constructor(url) {
    const expected = MockWebSocketClient.expectations.find(
      (expectation) => url.endsWith(expectation.url),
    );
    if (!expected) {
      throw new Error('Unexpected WebSocket connection');
    }

    this.messages = new BlockingQueue();
    this.listeners = {
      message: [],
      open: [],
      close: [],
      error: [],
    };

    Promise.resolve().then(() => {
      this.dispatchEvent('open', new CustomEvent('open'));
      const ws = {
        send: (data) => {
          this.dispatchEvent('message', new MessageEvent('message', { data }));
        },
        receive: () => this.messages.pop(),
      };
      expected.scriptFn(ws);
      this.dispatchEvent('close', new CloseEvent('close'));
    });
  }

  dispatchEvent(type, event) {
    this.listeners[type].forEach((listener) => listener(event));
  }

  addEventListener(type, fn) {
    if (!this.listeners[type]) {
      throw new Error(`Unknown event ${type}`);
    }
    this.listeners[type].push(fn);
  }

  removeEventListener(type, fn) {
    const i = this.listeners[type].findIndex(fn);
    if (i !== -1) {
      this.listeners[type].splice(i, 1);
    }
  }

  send(msg) {
    this.messages.push(msg);
  }

  close() {
    this.messages.push('<CLOSED BY CLIENT>');
  }
}

class MockWebSocket {
  register() {
    if (this.originalWebSocket) {
      throw new Error('mock WebSocket is already registered!');
    }
    this.originalWebSocket = global.WebSocket;
    global.WebSocket = MockWebSocketClient;
    this.requests = [];
    this.expectations = [];
  }

  unregister() {
    if (this.originalWebSocket) {
      global.WebSocket = this.originalWebSocket;
      this.originalWebSocket = null;
    }
  }
}

const mockWebSocket = new MockWebSocket();

beforeEach(() => {
  mockWebSocket.register();
});

afterEach(() => {
  mockWebSocket.unregister();
});

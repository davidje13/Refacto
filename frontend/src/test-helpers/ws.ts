import BlockingQueue from './BlockingQueue';

export interface MockWebSocketConnection {
  send: (data: string) => void;
  receive: () => Promise<string>;
  expect: (message: string) => Promise<void>;
  waitForClose: () => Promise<void>;
}

type ScriptFn = (socket: MockWebSocketConnection) => Promise<void>;

interface Expectation {
  url: string;
  scriptFn: ScriptFn;
}

class MockWebSocketClient extends EventTarget {
  private static expectations: Expectation[] = [];
  declare private readonly messages: BlockingQueue<string>;

  constructor(readonly url: string) {
    super();
    const expected = MockWebSocketClient.expectations.find((expectation) =>
      url.endsWith(expectation.url),
    );
    if (!expected) {
      throw new Error('Unexpected WebSocket connection');
    }

    this.messages = new BlockingQueue();

    void Promise.resolve().then(async () => {
      this.dispatchEvent(new CustomEvent('open'));
      await expected.scriptFn({
        send: (data: string) => {
          this.dispatchEvent(new MessageEvent('message', { data }));
        },
        receive: () => this.messages.pop(),
        expect: async (message) => {
          const received = await this.messages.pop();
          if (received !== message) {
            throw new Error(
              `Expected message: ${expected} but got: ${received}`,
            );
          }
        },
        waitForClose: async () => {
          while ((await this.messages.pop()) !== '<CLOSED BY CLIENT>') {}
        },
      });
      this.dispatchEvent(new CloseEvent('close'));
    });
  }

  static expect(url: string, scriptFn: ScriptFn) {
    MockWebSocketClient.expectations.push({ url, scriptFn });
  }

  send(msg: string) {
    this.messages.push(msg);
  }

  close() {
    this.messages.push('<CLOSED BY CLIENT>');
  }
}

class MockWebSocket {
  declare private originalWebSocket: typeof WebSocket | undefined;

  register() {
    if (this.originalWebSocket) {
      throw new Error('mock WebSocket is already registered!');
    }
    this.originalWebSocket = globalThis.WebSocket;
    globalThis.WebSocket = MockWebSocketClient as unknown as typeof WebSocket;
  }

  unregister() {
    if (this.originalWebSocket) {
      globalThis.WebSocket = this.originalWebSocket;
      this.originalWebSocket = undefined;
    }
  }
}

const mockWebSocket = new MockWebSocket();

export function mockWsExpect(url: string, scriptFn: ScriptFn) {
  MockWebSocketClient.expect(url, scriptFn);
}

beforeEach(() => {
  mockWebSocket.register();
});

afterEach(() => {
  mockWebSocket.unregister();
});

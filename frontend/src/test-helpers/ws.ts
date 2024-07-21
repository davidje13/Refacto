import BlockingQueue from 'blocking-queue';

export interface MockWebSocketConnection {
  send: (data: string) => void;
  receive: () => Promise<string>;
}

type ScriptFn = (socket: MockWebSocketConnection) => void;

interface Expectation {
  url: string;
  scriptFn: ScriptFn;
}

class MockWebSocketClient extends EventTarget {
  private static expectations: Expectation[] = [];

  private readonly messages: BlockingQueue<string>;

  public constructor(url: string) {
    super();
    const expected = MockWebSocketClient.expectations.find((expectation) =>
      url.endsWith(expectation.url),
    );
    if (!expected) {
      throw new Error('Unexpected WebSocket connection');
    }

    this.messages = new BlockingQueue();

    void Promise.resolve().then(() => {
      this.dispatchEvent(new CustomEvent('open'));
      expected.scriptFn({
        send: (data: string) => {
          this.dispatchEvent(new MessageEvent('message', { data }));
        },
        receive: () => this.messages.pop(),
      });
      this.dispatchEvent(new CloseEvent('close'));
    });
  }

  public static expect(url: string, scriptFn: ScriptFn) {
    MockWebSocketClient.expectations.push({ url, scriptFn });
  }

  public send(msg: string) {
    this.messages.push(msg);
  }

  public close() {
    this.messages.push('<CLOSED BY CLIENT>');
  }
}

class MockWebSocket {
  private originalWebSocket: typeof WebSocket | undefined;

  public register() {
    if (this.originalWebSocket) {
      throw new Error('mock WebSocket is already registered!');
    }
    this.originalWebSocket = (global as any).WebSocket;
    (global as any).WebSocket = MockWebSocketClient;
  }

  public unregister() {
    if (this.originalWebSocket) {
      (global as any).WebSocket = this.originalWebSocket;
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

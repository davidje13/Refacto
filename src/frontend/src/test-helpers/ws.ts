import BlockingQueue from 'blocking-queue';

export interface MockWebSocketConnection {
  send: (data: string) => void;
  receive: () => Promise<string>;
}

type ScriptFn = (socket: MockWebSocketConnection) => void;
type ListenerFn = (e: Event) => void;

interface Expectation {
  url: string;
  scriptFn: ScriptFn;
}

class MockWebSocketClient {
  private static expectations: Expectation[] = [];

  private readonly messages: BlockingQueue<string>;

  private readonly listeners: Record<string, ListenerFn[]>;

  public constructor(url: string) {
    const expected = MockWebSocketClient.expectations.find((expectation) =>
      url.endsWith(expectation.url),
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

    void Promise.resolve().then(() => {
      this.dispatchEvent('open', new CustomEvent('open'));
      expected.scriptFn({
        send: (data: string) => {
          this.dispatchEvent('message', new MessageEvent('message', { data }));
        },
        receive: () => this.messages.pop(),
      });
      this.dispatchEvent('close', new CloseEvent('close'));
    });
  }

  public static expect(url: string, scriptFn: ScriptFn): void {
    MockWebSocketClient.expectations.push({ url, scriptFn });
  }

  public addEventListener(type: string, fn: ListenerFn): void {
    if (!this.listeners[type]) {
      throw new Error(`Unknown event ${type}`);
    }
    this.listeners[type].push(fn);
  }

  public removeEventListener(type: string, fn: ListenerFn): void {
    const i = this.listeners[type].indexOf(fn);
    if (i !== -1) {
      this.listeners[type].splice(i, 1);
    }
  }

  public send(msg: string): void {
    this.messages.push(msg);
  }

  public close(): void {
    this.messages.push('<CLOSED BY CLIENT>');
  }

  private dispatchEvent(type: string, event: Event): void {
    this.listeners[type].forEach((listener) => listener(event));
  }
}

class MockWebSocket {
  private originalWebSocket: typeof WebSocket | undefined;

  public register(): void {
    if (this.originalWebSocket) {
      throw new Error('mock WebSocket is already registered!');
    }
    this.originalWebSocket = (global as any).WebSocket;
    (global as any).WebSocket = MockWebSocketClient;
  }

  public unregister(): void {
    if (this.originalWebSocket) {
      (global as any).WebSocket = this.originalWebSocket;
      this.originalWebSocket = undefined;
    }
  }
}

const mockWebSocket = new MockWebSocket();

export function mockWsExpect(url: string, scriptFn: ScriptFn): void {
  MockWebSocketClient.expect(url, scriptFn);
}

beforeEach(() => {
  mockWebSocket.register();
});

afterEach(() => {
  mockWebSocket.unregister();
});

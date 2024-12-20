import type { JsonData } from '../shared/api-entities';

interface MockExpectationT {
  readonly url: string;
  readonly options: RequestInit | undefined;
}

class MockExpectation implements MockExpectationT {
  public readonly url: string;

  public readonly options: RequestInit | undefined;

  private fn: ((request: MockRequest) => void) | undefined;

  public constructor(url: string, options?: RequestInit) {
    this.url = url;
    this.options = options;
    this.fn = undefined;
  }

  public handle(request: MockRequest) {
    this.fn?.(request);
  }

  public and(fn: (request: MockRequest) => void) {
    this.fn = fn;
  }

  public andRespond(body: string, init?: ResponseInit) {
    this.fn = (request) => request.respond(body, init);
  }

  public andRespondOk(body: string, init?: ResponseInit) {
    this.fn = (request) => request.respondOk(body, init);
  }

  public andRespondJsonOk(body: Readonly<JsonData>, init?: ResponseInit) {
    this.fn = (request) => request.respondJsonOk(body, init);
  }
}

interface ResponseWrapper {
  status: number;
  json: () => Promise<JsonData>;
}

class MockRequest {
  public readonly url: string;

  public readonly options: RequestInit;

  private internalResolve: ((res: ResponseWrapper) => void) | undefined;

  private internalReject: ((error: Error) => void) | undefined;

  public constructor(
    url: string,
    options: RequestInit,
    resolve: (res: ResponseWrapper) => void,
    reject: (error: Error) => void,
  ) {
    this.url = url;
    this.options = options;
    this.internalResolve = resolve;
    this.internalReject = reject;
  }

  public close() {
    this.internalResolve = undefined;
    this.internalReject = undefined;
  }

  public matches({ url, options = undefined }: MockExpectationT): boolean {
    if (options) {
      throw new Error('fetch options matching is not supported yet');
    }
    return this.url === url;
  }

  public respond(body: string = '', init: ResponseInit = {}) {
    this.internalResolve!(new Response(body, init));
    this.close();
  }

  public respondOk(body: string = '', init: ResponseInit = {}) {
    this.respond(body, { status: 200, ...init });
  }

  public respondJsonOk(body: Readonly<JsonData> = {}, init: ResponseInit = {}) {
    this.respond(JSON.stringify(body), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      ...init,
    });
  }

  public reject(error: Error) {
    this.internalReject!(error);
    this.close();
  }
}

class MockFetch {
  private unexpectedRequests: MockRequest[] = [];

  private expectations: MockExpectation[] = [];

  private originalFetch: typeof global.fetch | undefined;

  public register() {
    if (this.originalFetch) {
      throw new Error('mock fetch is already registered!');
    }
    this.originalFetch = (global as any).fetch;
    (global as any).fetch = jest
      .fn()
      .mockName('fetch')
      .mockImplementation(this.invoke);
    this.unexpectedRequests = [];
    this.expectations = [];
  }

  public unregister() {
    if (this.originalFetch) {
      (global as any).fetch = this.originalFetch;
      this.originalFetch = undefined;
    }
  }

  public expect(url: string, options?: RequestInit): MockExpectation {
    const expectation = new MockExpectation(url, options);
    this.expectations.push(expectation);
    return expectation;
  }

  public assertAllRequestsHandled() {
    const remaining = this.unexpectedRequests.map((req) => req.url);

    if (remaining.length > 0) {
      const expected = this.expectations.map((exp) => exp.url);
      throw new Error(
        [
          'Unexpected fetch request to:',
          ...remaining,
          '',
          'Expected requests to:',
          ...expected,
        ].join('\n'),
      );
    }
  }

  private invoke = (
    url: string,
    options: RequestInit = {},
  ): Promise<ResponseWrapper> =>
    new Promise((resolve, reject) => {
      const request = new MockRequest(url, options, resolve, reject);
      const expectation = this.expectations.find((exp) => request.matches(exp));
      if (expectation) {
        expectation.handle(request);
      } else {
        this.unexpectedRequests.push(request);
      }
    });
}

const mockFetch = new MockFetch();

export function mockFetchExpect(
  url: string,
  options?: RequestInit,
): MockExpectation {
  return mockFetch.expect(url, options);
}

beforeEach(() => {
  mockFetch.register();
});

afterEach(() => {
  mockFetch.unregister();
  mockFetch.assertAllRequestsHandled();
});

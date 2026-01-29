import type { JsonData } from '../shared/api-entities';

interface MockExpectationT {
  readonly url: string;
  readonly options: RequestInit | undefined;
}

class MockExpectation implements MockExpectationT {
  declare readonly url: string;
  declare readonly options: RequestInit | undefined;
  declare private fn: ((request: MockRequest) => void) | undefined;

  constructor(url: string, options?: RequestInit) {
    this.url = url;
    this.options = options;
    this.fn = undefined;
  }

  handle(request: MockRequest) {
    this.fn?.(request);
  }

  and(fn: (request: MockRequest) => void) {
    this.fn = fn;
  }

  andRespond(body: string, init?: ResponseInit) {
    this.fn = (request) => request.respond(body, init);
  }

  andRespondOk(body: string, init?: ResponseInit) {
    this.fn = (request) => request.respondOk(body, init);
  }

  andRespondJsonOk(body: Readonly<JsonData>, init?: ResponseInit) {
    this.fn = (request) => request.respondJsonOk(body, init);
  }
}

interface ResponseWrapper {
  status: number;
  json: () => Promise<JsonData>;
}

class MockRequest {
  declare readonly url: string;
  declare readonly options: RequestInit;
  declare private internalResolve: ((res: ResponseWrapper) => void) | undefined;
  declare private internalReject: ((error: Error) => void) | undefined;

  constructor(
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

  close() {
    this.internalResolve = undefined;
    this.internalReject = undefined;
  }

  matches({ url, options = undefined }: MockExpectationT): boolean {
    if (options) {
      throw new Error('fetch options matching is not supported yet');
    }
    return this.url === url;
  }

  respond(body: string = '', init: ResponseInit = {}) {
    this.internalResolve!(new Response(body, init));
    this.close();
  }

  respondOk(body: string = '', init: ResponseInit = {}) {
    this.respond(body, { status: 200, ...init });
  }

  respondJsonOk(body: Readonly<JsonData> = {}, init: ResponseInit = {}) {
    this.respond(JSON.stringify(body), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      ...init,
    });
  }

  reject(error: Error) {
    this.internalReject!(error);
    this.close();
  }
}

class MockFetch {
  private unexpectedRequests: MockRequest[] = [];
  private expectations: MockExpectation[] = [];
  declare private originalFetch: typeof global.fetch | undefined;

  register() {
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

  unregister() {
    if (this.originalFetch) {
      (global as any).fetch = this.originalFetch;
      this.originalFetch = undefined;
    }
  }

  expect(url: string, options?: RequestInit): MockExpectation {
    const expectation = new MockExpectation(url, options);
    this.expectations.push(expectation);
    return expectation;
  }

  assertAllRequestsHandled() {
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

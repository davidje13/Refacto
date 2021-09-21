import { Subject as MockSubject } from 'rxjs';
import type { JsonData } from 'refacto-entities';

interface AjaxConfig {
  url: string;
  body?: any;
  method?: string;
  headers?: Readonly<Record<string, any>>;
}

type FetchFn = (input: RequestInfo, init?: RequestInit) => Promise<Response>;

jest.mock('rxjs/ajax', () => ({
  ajax: (config: AjaxConfig): MockSubject<unknown> => {
    const subject = new MockSubject();
    const init = { method: config.method, headers: config.headers };
    ((global as any).fetch as FetchFn)(config.url, init)
      .then(async (response) => {
        if (response.status >= 300) {
          subject.error({ status: response.status });
          return;
        }
        const json = await response.json();
        subject.next({ status: response.status, response: json });
        subject.complete();
      })
      .catch((e) => {
        subject.error(e);
      });
    return subject;
  },
}));

interface MockExpectationT {
  readonly url: string;
  readonly options?: RequestInit;
}

class MockExpectation implements MockExpectationT {
  public readonly url: string;

  public readonly options?: RequestInit;

  private fn?: (request: MockRequest) => void;

  public constructor(url: string, options?: RequestInit) {
    this.url = url;
    this.options = options;
    this.fn = undefined;
  }

  public handle(request: MockRequest): void {
    this.fn?.(request);
  }

  public and(fn: (request: MockRequest) => void): void {
    this.fn = fn;
  }

  public andRespond(body: string, init?: RequestInit): void {
    this.fn = (request): void => request.respond(body, init);
  }

  public andRespondOk(body: string, init?: RequestInit): void {
    this.fn = (request): void => request.respondOk(body, init);
  }

  public andRespondJsonOk(body: Readonly<JsonData>, init?: RequestInit): void {
    this.fn = (request): void => request.respondJsonOk(body, init);
  }
}

interface ResponseWrapper {
  status: number;
  json: () => Promise<JsonData>;
}

interface InitWithStatus extends RequestInit {
  status?: number;
}

class MockRequest {
  public readonly url: string;

  public readonly options: RequestInit;

  private internalResolve?: (res: ResponseWrapper) => void;

  private internalReject?: (error: Error) => void;

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

  public close(): void {
    this.internalResolve = undefined;
    this.internalReject = undefined;
  }

  public matches({ url, options = undefined }: MockExpectationT): boolean {
    if (options) {
      throw new Error('fetch options matching is not supported yet');
    }
    return this.url === url;
  }

  public respond(body: string | null = null, init: InitWithStatus = {}): void {
    // const response = new Response(body, init)
    const response = {
      status: init.status || 200,
      json: (): Promise<JsonData> => Promise.resolve(JSON.parse(body!)),
    };
    this.internalResolve!(response);
    this.close();
  }

  public respondOk(body: string | null = null, init: RequestInit = {}): void {
    this.respond(body, { status: 200, ...init });
  }

  public respondJsonOk(body: Readonly<JsonData> = {}, init: RequestInit = {}): void {
    this.respond(JSON.stringify(body), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      ...init,
    });
  }

  public reject(error: Error): void {
    this.internalReject!(error);
    this.close();
  }
}

class MockFetch {
  private unexpectedRequests: MockRequest[] = [];

  private expectations: MockExpectation[] = [];

  private originalFetch?: FetchFn;

  public register(): void {
    if (this.originalFetch) {
      throw new Error('mock fetch is already registered!');
    }
    this.originalFetch = (global as any).fetch;
    (global as any).fetch = jest.fn().mockName('fetch')
      .mockImplementation(this.invoke);
    this.unexpectedRequests = [];
    this.expectations = [];
  }

  public unregister(): void {
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

  public assertAllRequestsHandled(): void {
    const remaining = this.unexpectedRequests.map((req) => req.url);

    if (remaining.length > 0) {
      const expected = this.expectations.map((exp) => exp.url);
      throw new Error([
        'Unexpected fetch request to:',
        ...remaining,
        '',
        'Expected requests to:',
        ...expected,
      ].join('\n'));
    }
  }

  private invoke = (
    url: string,
    options: RequestInit = {},
  ): Promise<ResponseWrapper> => new Promise((resolve, reject): void => {
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

// eslint-disable-next-line import/prefer-default-export
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

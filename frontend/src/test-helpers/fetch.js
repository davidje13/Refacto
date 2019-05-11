jest.mock('rxjs/ajax', () => ({
  ajax: (url) => {
    /* eslint-disable-next-line global-require */
    const { Subject } = require('rxjs');
    const subject = new Subject();
    global.fetch(url)
      .then(async (response) => {
        if (response.status >= 300) {
          subject.error({ status: response.status });
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

class MockExpectation {
  constructor(url, options) {
    this.url = url;
    this.options = options;
    this.fn = null;
  }

  and(fn) {
    this.fn = fn;
  }

  andRespond(body, init) {
    this.fn = (request) => request.respond(body, init);
  }

  andRespondOk(body, init) {
    this.fn = (request) => request.respondOk(body, init);
  }

  andRespondJsonOk(body, init) {
    this.fn = (request) => request.respondJsonOk(body, init);
  }
}

class MockRequest {
  constructor(url, options, resolve, reject) {
    this.url = url;
    this.options = options;
    this.internalResolve = resolve;
    this.internalReject = reject;
    this.closed = false;
  }

  close() {
    this.internalResolve = null;
    this.internalReject = null;
    this.closed = true;
  }

  matches({ url, options = null }) {
    if (options) {
      throw new Error('fetch options matching is not supported yet');
    }
    return this.url === url;
  }

  respond(body = null, init = {}) {
    // const response = new Response(body, init)
    const response = {
      status: init.status || 200,
      json: () => Promise.resolve(JSON.parse(body)),
    };
    this.internalResolve(response);
    this.close();
  }

  respondOk(body = null, init = {}) {
    this.respond(body, { status: 200, ...init });
  }

  respondJsonOk(body = {}, init = {}) {
    this.respond(JSON.stringify(body), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      ...init,
    });
  }

  reject(error) {
    this.internalReject(error);
    this.close();
  }
}

class MockFetch {
  constructor() {
    this.requests = [];
    this.expectations = [];
  }

  invoke = (url, options) => new Promise((resolve, reject) => {
    const request = new MockRequest(url, options, resolve, reject);
    this.requests.push(request);
    const expectation = this.expectations.find((exp) => request.matches(exp));
    if (expectation && expectation.fn) {
      expectation.fn(request);
    }
  });

  expect = (url, options) => {
    const expectation = new MockExpectation(url, options);
    this.expectations.push(expectation);
    return expectation;
  };

  register() {
    if (this.originalFetch) {
      throw new Error('mock fetch is already registered!');
    }
    this.originalFetch = global.fetch;
    global.fetch = jest.fn().mockName('fetch').mockImplementation(this.invoke);
    global.fetch.mockExpect = this.expect;
    this.requests = [];
    this.expectations = [];
  }

  unregister() {
    if (this.originalFetch) {
      global.fetch = this.originalFetch;
      this.originalFetch = null;
    }
  }
}

const mockFetch = new MockFetch();

beforeEach(() => {
  mockFetch.register();
});

afterEach(() => {
  mockFetch.unregister();

  const unexpected = mockFetch.requests.filter((request) => !request.closed);
  expect(unexpected).toEqual([]);
});

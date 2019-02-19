import fetch from 'jest-fetch-mock';

global.fetch = fetch;

beforeEach(() => {
  fetch.resetMocks();
  fetch.mockReject(new Error('endpoint not mocked'));
});

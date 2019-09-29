import 'jest'; /* eslint-disable-line jest/no-jest-import */ // mark as module

jest.useFakeTimers();

afterEach(() => {
  jest.clearAllTimers();
});

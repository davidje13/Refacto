import 'jest'; /* eslint-disable-line jest/no-jest-import */ // mark as module

const spyConsole: any = console;

// Automatically fail tests if errors or warnings are logged to the console

interface CustomMatcherResult {
  pass: boolean;
  message: string | (() => string);
}

function checkConsoleOutput(
  console: Record<string, jest.Mock<void, [...string[]]>>,
  methodName: string,
  friendlyName: string,
): CustomMatcherResult {
  const lines = console[methodName].mock.calls;
  if (lines.length) {
    return {
      pass: false,
      message: (): string => `Expected no console ${friendlyName}s, got:\n\n${lines.join('\n\n')}`,
    };
  }

  return {
    pass: true,
    message: (): string => `Expected a console ${friendlyName}, but got nothing`,
  };
}

declare global {
  namespace jest { // eslint-disable-line @typescript-eslint/no-namespace
    interface Matchers<R> {
      toHaveReportedNoErrors: () => R;
      toHaveReportedNoWarnings: () => R;
    }
  }
}

expect.extend({
  toHaveReportedNoErrors(console): CustomMatcherResult {
    return checkConsoleOutput(console, 'error', 'error');
  },
  toHaveReportedNoWarnings(console): CustomMatcherResult {
    return checkConsoleOutput(console, 'warn', 'warning');
  },
});

beforeEach(() => {
  if (spyConsole.error.mock) {
    spyConsole.error.mockRestore();
  }
  if (spyConsole.warn.mock) {
    spyConsole.warn.mockRestore();
  }
  jest.spyOn(spyConsole, 'error');
  jest.spyOn(spyConsole, 'warn');
});

afterEach(() => {
  expect(spyConsole).toHaveReportedNoErrors();
  expect(spyConsole).toHaveReportedNoWarnings();
  spyConsole.error.mockRestore();
  spyConsole.warn.mockRestore();
});

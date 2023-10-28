const spyConsole: any = console;

// Automatically fail tests if errors or warnings are logged to the console

function checkConsoleOutput(
  console: Record<string, jest.Mock<void, [...string[]]>>,
  methodName: string,
  friendlyName: string,
): jest.CustomMatcherResult {
  const lines = console[methodName]?.mock?.calls;
  if (!lines) {
    throw new Error(`console.${methodName} is not mocked`);
  }

  if (lines.length) {
    return {
      pass: false,
      message: (): string =>
        `Expected no console ${friendlyName}s, got:\n\n${lines.join('\n\n')}`,
    };
  }

  return {
    pass: true,
    message: (): string =>
      `Expected a console ${friendlyName}, but got nothing`,
  };
}

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveReportedNoErrors: () => R;
      toHaveReportedNoWarnings: () => R;
    }
  }
}

expect.extend({
  toHaveReportedNoErrors(console): jest.CustomMatcherResult {
    return checkConsoleOutput(console, 'error', 'error');
  },
  toHaveReportedNoWarnings(console): jest.CustomMatcherResult {
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

export default 0; // mark as module

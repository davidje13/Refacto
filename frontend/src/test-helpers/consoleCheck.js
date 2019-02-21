const spyConsole = console;

// Automatically fail tests if errors or warnings are logged to the console

function checkConsoleOutput(console, methodName, friendlyName) {
  const lines = console[methodName].mock.calls;
  if (lines.length) {
    return {
      pass: false,
      message: () => `Expected no console ${friendlyName}s, got:\n\n${lines.join('\n\n')}`,
    };
  }

  return {
    pass: true,
    message: () => `Expected a console ${friendlyName}, but got nothing`,
  };
}

expect.extend({
  toHaveReportedNoErrors(console) {
    return checkConsoleOutput(console, 'error', 'error');
  },
  toHaveReportedNoWarnings(console) {
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
  expect(spyConsole).toHaveReportedNoErrors('error');
  expect(spyConsole).toHaveReportedNoWarnings('warn');
  spyConsole.error.mockRestore();
  spyConsole.warn.mockRestore();
});

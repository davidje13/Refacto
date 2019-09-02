#!/usr/bin/env node

const path = require('path');
const util = require('util');
const childProcess = require('child_process');
const execFile = util.promisify(childProcess.execFile);

const packages = ['frontend', 'backend', 'e2e'];

const baseDir = path.join(__dirname, '..');

(async () => {
  process.stdout.write('Linting...\n');

  const eslintCommand = 'npm';
  const eslintArgs = ['run', 'lint:eslint', '--silent', '--'];

  const tscCommand = 'npm';
  const tscArgs = ['run', 'lint:tsc', '--silent', '--'];

  if (process.stdout.isTTY) {
    eslintArgs.push('--color');
    tscArgs.push('--pretty');
  }

  const failures = await Promise.all(packages.map(async (package) => {
    try {
      await execFile(eslintCommand, eslintArgs, {
        cwd: path.join(baseDir, package),
        stdio: ['ignore', 'pipe', 'inherit'],
      });
      await execFile(tscCommand, tscArgs, {
        cwd: path.join(baseDir, package),
        stdio: ['ignore', 'pipe', 'inherit'],
      });
      process.stderr.write(`Lint ${package} succeeded\n`);
      return false;
    } catch (err) {
      process.stderr.write(`Lint ${package} failed:\n\n`);
      process.stderr.write(err.stdout);
      process.stderr.write('\n\n');
      return true;
    }
  }));

  if (failures.some((failure) => failure)) {
    process.stdout.write('Linting failed\n');
    process.exit(1);
  }

  process.stdout.write('Linting successful\n');
})();

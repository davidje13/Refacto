#!/usr/bin/env node

const path = require('path');
const util = require('util');
const childProcess = require('child_process');
const execFile = util.promisify(childProcess.execFile);

const packages = ['frontend', 'backend', 'e2e'];

const baseDir = path.join(__dirname, '..');

(async () => {
  process.stdout.write('Linting...\n');

  const prettierCommand = 'npm';
  const prettierArgs = ['run', 'lint:prettier', '--quiet', '--'];

  const eslintCommand = 'npm';
  const eslintArgs = ['run', 'lint:eslint', '--quiet', '--'];

  const tscCommand = 'npm';
  const tscArgs = ['run', 'lint:tsc', '--quiet', '--'];

  if (process.stdout.isTTY) {
    eslintArgs.push('--color');
    tscArgs.push('--pretty');
  }

  const failures = await Promise.all(packages.map(async (package) => {
    try {
      await execFile(eslintCommand, eslintArgs, {
        cwd: path.join(baseDir, 'src', package),
        stdio: ['ignore', 'pipe', 'inherit'],
      });
      await execFile(tscCommand, tscArgs, {
        cwd: path.join(baseDir, 'src', package),
        stdio: ['ignore', 'pipe', 'inherit'],
      });
      await execFile(prettierCommand, prettierArgs, {
        cwd: path.join(baseDir, 'src', package),
        stdio: ['ignore', 'pipe', 'inherit'],
      });
      process.stderr.write(`Lint ${package} succeeded\n`);
      return false;
    } catch (err) {
      process.stderr.write(`Lint ${package} failed:\n\n`);
      process.stderr.write(err.stdout);
      if (err.stderr) {
        process.stderr.write('\n');
        process.stderr.write(err.stderr);
      }
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

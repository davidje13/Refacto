#!/usr/bin/env node

import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
const asyncExecFile = promisify(execFile);

const packages = ['frontend', 'backend', 'e2e'];

const basedir = join(dirname(fileURLToPath(import.meta.url)), '..');

process.stdout.write('Linting...\n');

const prettierCommand = 'npm';
const prettierArgs = ['run', 'lint:prettier', '--quiet', '--'];

const tscCommand = 'npm';
const tscArgs = ['run', 'lint:tsc', '--quiet', '--'];

if (process.stdout.isTTY) {
  tscArgs.push('--pretty');
}

const failures = await Promise.all(packages.map(async (pkg) => {
  try {
    const cwd = join(basedir, pkg);
    const stdio = ['ignore', 'pipe', 'inherit'];
    await asyncExecFile(tscCommand, tscArgs, { cwd, stdio });
    await asyncExecFile(prettierCommand, prettierArgs, { cwd, stdio });
    process.stderr.write(`Lint ${pkg} succeeded\n`);
    return false;
  } catch (err) {
    process.stderr.write(`Lint ${pkg} failed:\n\n`);
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

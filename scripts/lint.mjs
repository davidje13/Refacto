#!/usr/bin/env node

import { join } from 'node:path';
import { basedir, log } from './helpers/io.mjs';
import { runMultipleTasks } from './helpers/proc.mjs';

const packages = ['frontend', 'backend', 'e2e'];

log('Linting...');

const prettierArgs = ['--check', '.'];
const tscArgs = [];
if (process.stdout.isTTY) {
  tscArgs.push('--pretty');
}

await runMultipleTasks(
  packages.flatMap((pkg) => [
    {
      command: join(basedir, pkg, 'node_modules', '.bin', 'tsc'),
      args: tscArgs,
      cwd: join(basedir, pkg),
      outputMode: 'fail_atomic',
      successMessage: `Lint ${pkg} (tsc) passed`,
      failureMessage: `Lint ${pkg} (tsc) failed`,
    },
    {
      command: join(basedir, pkg, 'node_modules', '.bin', 'prettier'),
      args: prettierArgs,
      cwd: join(basedir, pkg),
      outputMode: 'fail_atomic',
      successMessage: `Lint ${pkg} (prettier) passed`,
      failureMessage: `Lint ${pkg} (prettier) failed`,
    },
  ]),
  { parallel: true },
);

log('Linting successful');

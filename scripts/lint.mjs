#!/usr/bin/env node

import { join } from 'node:path';
import { basedir, log } from './helpers/io.mjs';
import { runTaskPrintOnFailure } from './helpers/proc.mjs';

const packages = ['frontend', 'backend', 'e2e'];

log('Linting...');

const prettierArgs = ['--check', '.'];
const tscArgs = [];
if (process.stdout.isTTY) {
  tscArgs.push('--pretty');
}

try {
  await Promise.all(
    packages.map(async (pkg) => {
      await runTaskPrintOnFailure({
        command: join(basedir, pkg, 'node_modules', '.bin', 'tsc'),
        args: tscArgs,
        cwd: join(basedir, pkg),
        failMessage: `Lint ${pkg} (tsc) failed`,
      });
      await runTaskPrintOnFailure({
        command: join(basedir, pkg, 'node_modules', '.bin', 'prettier'),
        args: prettierArgs,
        cwd: join(basedir, pkg),
        failMessage: `Lint ${pkg} (prettier) failed`,
      });
      log(`Lint ${pkg} succeeded`);
    }),
  );
} catch {
  log('Linting failed');
  process.exit(1);
}

log('Linting successful');

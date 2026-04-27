#!/usr/bin/env node

import { basedir } from './helpers/io.mjs';
import { runMultipleTasks } from './helpers/proc.mjs';

const packages = [
  { name: 'shared', pkg: '@refacto/shared' },
  { name: 'frontend', pkg: '@refacto/frontend' },
  { name: 'backend', pkg: '@refacto/backend' },
  { name: 'e2e', pkg: '@refacto/e2e' },
];

await runMultipleTasks(
  packages.map(({ name, pkg }) => ({
    command: 'npm',
    args: ['run', 'lint:tsc', '--workspace=' + pkg, '--quiet'],
    cwd: basedir,
    outputMode: 'fail_atomic',
    successMessage: `Lint ${name} (tsc) passed`,
    failureMessage: `Lint ${name} (tsc) failed`,
  })),
  { parallel: true },
);

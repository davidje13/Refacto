#!/usr/bin/env node

import { join } from 'node:path';
import { basedir, deleteDirectory, log, readJSON } from './helpers/io.mjs';
import { stat } from 'node:fs/promises';
import { exitWithCode, runTask } from './helpers/proc.mjs';

const SKIP_E2E_DEPS = (process.env['SKIP_E2E_DEPS'] ?? 'false') === 'true';
const FORCE = process.argv.slice(2).includes('--force');

const packageJson = await readJSON(join(basedir, 'package.json'));
const dependencyKeys = Object.keys(packageJson).filter((k) =>
  k.toLowerCase().includes('dependencies'),
);
if (dependencyKeys.length > 0) {
  log(`
Dependencies should not be installed in root package.json!
- remove ${dependencyKeys.map((v) => `"${v}"`).join(', ')}
- add the dependencies to the desired subproject instead
- re-run install
`);
  await deleteDirectory(join(basedir, 'node_modules'));
  await exitWithCode(1);
}

async function installPackage(pkg) {
  const s = await stat(join(basedir, pkg, 'node_modules')).catch(() => null);
  if (s === null || FORCE) {
    await runTask({
      command: 'npm',
      args: ['install', '--quiet'],
      beginMessage: `Installing ${pkg} dependencies...`,
      cwd: join(basedir, pkg),
      env: { ...process.env, DISABLE_OPENCOLLECTIVE: '1' },
    });
  }
}

await installPackage('frontend');
await installPackage('backend');
if (!SKIP_E2E_DEPS) {
  await installPackage('e2e');
}

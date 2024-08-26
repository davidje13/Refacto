#!/usr/bin/env node

import { join } from 'node:path';
import { basedir, deleteDirectory, log } from './helpers/io.mjs';
import { stat, mkdir } from 'node:fs/promises';
import {
  exitWithCode,
  printPrefixed,
  runBackgroundTask,
  runTask,
  waitForOutput,
} from './helpers/proc.mjs';
import { makeRandomAppSecrets } from './helpers/random.mjs';

const builddir = join(basedir, 'build');
const downloads = join(basedir, 'e2e', 'build', 'downloads');

// clear downloads from previous run
await deleteDirectory(downloads);
await mkdir(downloads, { recursive: true });

const testEnv = { ...process.env };

let appLogs;
const port = Number.parseInt(process.env['PORT'] ?? '5010');

await runTask({
  command: join(basedir, 'scripts', 'build.mjs'),
  args: ['--keep-deps'],
});

if (!(await stat(join(builddir, 'node_modules')).catch(() => null))) {
  await runTask({
    command: 'npm',
    args: ['install', '--omit=dev', '--quiet'],
    cwd: builddir,
  });
}

const mockSSOPort = port + 2;
const mockSSOHost = `http://localhost:${mockSSOPort}`;

const appEnv = {
  ...process.env,
  PORT: String(port),
  SERVER_BIND_ADDRESS: 'localhost',
  DB_URL: 'memory://refacto?simulatedLatency=50',
  MOCK_SSO_PORT: mockSSOPort,
  SSO_GOOGLE_CLIENT_ID: 'mock-client-id',
  SSO_GOOGLE_AUTH_URL: `${mockSSOHost}/auth`,
  SSO_GOOGLE_TOKEN_INFO_URL: `${mockSSOHost}/tokeninfo`,
  PASSWORD_WORK_FACTOR: 4,
};

const secrets = makeRandomAppSecrets();
for (const [env, value] of secrets) {
  process.stderr.write(`${env}=${value}\n`);
  appEnv[env] = value;
}

const begin = Date.now();
const appProc = runBackgroundTask({
  command: 'node',
  args: [
    '--disable-proto=throw',
    // TODO replace express with something else to be able to add this
    //'--disallow-code-generation-from-strings',
    join(builddir, 'index.js'),
  ],
  env: appEnv,
  stdio: ['ignore', 'ignore', 'pipe'],
});

// Wait for startup
appLogs = waitForOutput(appProc.stdio[2], 'Available at', 30 * 1000);
try {
  await appLogs.promise;
  log(`Application started in ${((Date.now() - begin) * 0.001).toFixed(3)}s`);
} catch (e) {
  log(`Application logs:`);
  printPrefixed(process.stderr, appLogs.getOutput(), 'log');
  await exitWithCode(
    1,
    `Failed to start server for E2E tests: ${e} (exit code: ${appProc.exitCode})`,
  );
}

testEnv['TARGET_HOST'] = `http://localhost:${port}/`;

// Run tests

try {
  await runTask({
    command: 'npm',
    args: ['test', '--quiet'],
    cwd: join(basedir, 'e2e'),
    env: { ...testEnv, SELENIUM_BROWSER: 'chrome' },
    exitOnFailure: false,
  });
} catch {
  if (appLogs) {
    log(`\nApplication logs:`);
    printPrefixed(process.stderr, appLogs.getOutput(), 'log');
  }
  await exitWithCode(1, 'End-to-end tests failed.');
}

await exitWithCode(0, 'Testing complete: pass.'); // ensure app is closed

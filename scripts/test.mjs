#!/usr/bin/env node

import { join } from 'node:path';
import { basedir, deleteDirectory, findFiles, log } from './helpers/io.mjs';
import { stat, mkdir } from 'node:fs/promises';
import {
  exitWithCode,
  printPrefixed,
  runBackgroundTask,
  runMultipleTasks,
  runTask,
  waitForOutput,
} from './helpers/proc.mjs';
import { makeRandomAppSecrets } from './helpers/random.mjs';
import { TEST_RUNTIME_FLAGS } from './helpers/flags.mjs';

const PARALLEL_E2E = (process.env['PARALLEL_E2E'] ?? 'true') === 'true';
const FOCUS_BROWSER = process.env['BROWSER'];
const SKIP_UNIT = process.argv.slice(2).includes('--only-e2e');

const units = ['frontend', 'backend'];

if (!SKIP_UNIT) {
  await runMultipleTasks(
    units.map((pkg) => ({
      command: 'npm',
      args: ['test', '--quiet'],
      cwd: join(basedir, pkg),
      beginMessage: `\nTesting ${pkg}...\n`,
      failureMessage: `Unit tests failed: ${pkg}.`,
    })),
    { parallel: false },
  );
}

log('\nRunning end-to-end tests...');

const browsers = [
  { browser: 'chrome', format: '32' },
  { browser: 'firefox', format: '33' },
];

const filteredBrowsers = FOCUS_BROWSER
  ? browsers.filter(({ browser }) => browser === FOCUS_BROWSER)
  : browsers;

if (!filteredBrowsers.length) {
  await exitWithCode(
    1,
    `No end-to-end tests to run: ${FOCUS_BROWSER} is not available.`,
  );
}

const builddir = join(basedir, 'build');
const downloads = join(basedir, 'e2e', 'build', 'downloads');

// clear downloads from previous run
await deleteDirectory(downloads);
await mkdir(downloads, { recursive: true });

const testEnv = { ...process.env };

let appLogs;
if (!testEnv['TARGET_HOST']) {
  const port = Number.parseInt(process.env['PORT'] ?? '5010');

  log('Building application...');
  await runTask({
    command: join(basedir, 'scripts', 'build.mjs'),
    args: ['--keep-deps'],
  });

  if (!(await stat(join(builddir, 'node_modules')).catch(() => null))) {
    log('Installing production dependencies...');
    await runTask({
      command: 'npm',
      args: ['install', '--omit=dev', '--quiet'],
      cwd: builddir,
    });
  }

  log('Using mock authentication provider');
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
    SSO_GOOGLE_CERTS_URL: `${mockSSOHost}/certs`,
    PASSWORD_WORK_FACTOR: 4,
  };

  log('Using randomised secrets');
  const secrets = makeRandomAppSecrets();
  for (const [env, value] of secrets) {
    process.stderr.write(`${env}=${value}\n`);
    appEnv[env] = value;
  }

  log('Starting application');
  const begin = Date.now();
  const appProc = runBackgroundTask({
    command: 'node',
    args: [...TEST_RUNTIME_FLAGS, join(builddir, 'index.js')],
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
}

// Run tests

try {
  await runMultipleTasks(
    filteredBrowsers.map(({ browser, format }) => ({
      command: 'npm',
      args: ['test', '--quiet'],
      cwd: join(basedir, 'e2e'),
      env: { ...testEnv, SELENIUM_BROWSER: browser },
      beginMessage: `E2E testing in ${browser}...`,
      failureMessage: `E2E tests failed in ${browser}`,
      outputPrefix: browser,
      prefixFormat: format,
      exitOnFailure: false,
    })),
    { parallel: PARALLEL_E2E },
  );
} catch {
  if (appLogs) {
    log(`\nApplication logs:`);
    printPrefixed(process.stderr, appLogs.getOutput(), 'log');
  }
  log('\nFiles downloaded:');
  log((await findFiles(downloads)).join('\n'));
  await exitWithCode(1, 'End-to-end tests failed.');
}

await exitWithCode(0, 'Testing complete: pass.'); // ensure app is closed

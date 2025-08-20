#!/usr/bin/env node

import { join } from 'node:path';
import { basedir, deleteDirectory, log } from './helpers/io.mjs';
import { runMultipleTasks } from './helpers/proc.mjs';
import { LOCAL_RUNTIME_FLAGS } from './helpers/flags.mjs';

const forceMockSSO = process.argv.slice(2).includes('--mock-sso');
const apiPort = Number.parseInt(process.env['PORT'] ?? '5000');
const appPort = apiPort + 1;

const frontendEnv = {
  ...process.env,
  PORT: String(appPort),
};

const backendEnv = {
  ...process.env,
  PORT: String(apiPort),
  FORWARD_HOST: `http://localhost:${appPort}`,
  SERVER_BIND_ADDRESS: 'localhost',
};

if (
  forceMockSSO ||
  (!process.env['SSO_GOOGLE_CLIENT_ID'] &&
    !process.env['SSO_GITHUB_CLIENT_ID'] &&
    !process.env['SSO_GITLAB_CLIENT_ID'] &&
    !process.env['INSECURE_SHARED_ACCOUNT_ENABLED'])
) {
  log('Using mock authentication provider');
  const mockSSOPort = apiPort + 2;
  const mockSSOHost = `http://localhost:${mockSSOPort}`;
  backendEnv['MOCK_SSO_PORT'] = mockSSOPort;
  backendEnv['SSO_GOOGLE_CLIENT_ID'] = 'mock-client-id';
  backendEnv['SSO_GOOGLE_AUTH_URL'] = `${mockSSOHost}/auth`;
  backendEnv['SSO_GOOGLE_TOKEN_INFO_URL'] = `${mockSSOHost}/tokeninfo`;
}

await deleteDirectory(join(basedir, 'backend', 'build'));

log('Starting application...');
await runMultipleTasks(
  [
    {
      command: 'npm',
      args: ['start', '--quiet'],
      cwd: join(basedir, 'frontend'),
      env: frontendEnv,
      failureMessage: 'Failed to run frontend',
      outputPrefix: 'frontend',
      prefixFormat: '35',
    },
    {
      command: 'npm',
      args: ['run', '--quiet', 'build-watch'],
      cwd: join(basedir, 'backend'),
      stdinPipe: true, // stdin must remain open for rollup to keep running in watch mode
      allowExit: false, // any exit status means we are no longer watching
      failureMessage: 'Failed to build backend',
      outputPrefix: 'backend-build',
      prefixFormat: '34',
    },
    {
      awaitFile: join(basedir, 'backend', 'build', 'index.js'),
      command: 'node',
      args: [...LOCAL_RUNTIME_FLAGS, '--watch', 'build/index.js'],
      cwd: join(basedir, 'backend'),
      env: backendEnv,
      failureMessage: 'Failed to run backend',
      outputPrefix: 'backend',
      prefixFormat: '36',
    },
  ],
  { parallel: true },
);

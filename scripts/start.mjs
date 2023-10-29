#!/usr/bin/env node

import { join } from 'node:path';
import { basedir, log } from './helpers/io.mjs';
import { runMultipleTasks } from './helpers/proc.mjs';

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
    !process.env['SSO_GITLAB_CLIENT_ID'])
) {
  log('Using mock authentication provider');
  const mockSSOPort = apiPort + 2;
  const mockSSOHost = `http://localhost:${mockSSOPort}`;
  backendEnv['MOCK_SSO_PORT'] = mockSSOPort;
  backendEnv['SSO_GOOGLE_CLIENT_ID'] = 'mock-client-id';
  backendEnv['SSO_GOOGLE_AUTH_URL'] = `${mockSSOHost}/auth`;
  backendEnv['SSO_GOOGLE_TOKEN_INFO_URL'] = `${mockSSOHost}/tokeninfo`;
}

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
      args: ['start', '--quiet'],
      cwd: join(basedir, 'backend'),
      env: backendEnv,
      failureMessage: 'Failed to run backend',
      outputPrefix: 'backend',
      prefixFormat: '36',
    },
  ],
  { parallel: true },
);

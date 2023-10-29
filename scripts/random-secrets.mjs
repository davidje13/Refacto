#!/usr/bin/env node

import { makeRandomAppSecrets } from './helpers/random.mjs';

for (const [env, value] of makeRandomAppSecrets()) {
  process.stdout.write(`${env}=${value}\n`);
}

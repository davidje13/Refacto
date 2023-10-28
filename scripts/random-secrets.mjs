#!/usr/bin/env node

import { randomBytes } from 'node:crypto';

const ASCII62 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function makeRandomAscii(length) {
  const alphabet = ASCII62;
  const limit = Math.floor(256 / alphabet.length) * alphabet.length;
  return new Array(length).fill(0).map(() => {
    while (true) {
      const v = randomBytes(1)[0];
      if (v < limit) {
        return alphabet[v % alphabet.length];
      }
    }
  }).join('');
}

function makeRandomKey(bytes) {
  return randomBytes(bytes).toString('hex');
}

process.stdout.write('PASSWORD_SECRET_PEPPER=' + makeRandomAscii(48) + '\n');
process.stdout.write('ENCRYPTION_SECRET_KEY=' + makeRandomKey(32) + '\n');
process.stdout.write('TOKEN_SECRET_PASSPHRASE=' + makeRandomAscii(48) + '\n');

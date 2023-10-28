#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { statSync, readdirSync } from 'node:fs';
import { brotliCompress, gzip, constants } from 'node:zlib';
import { join } from 'node:path';
import { promisify } from 'node:util';

const asyncBrotliCompress = promisify(brotliCompress);
const asyncGzipCompress = promisify(gzip);
const CONST = constants;

const root = process.argv[2];
if (!root) {
  throw new Error('No root directory given!');
}

const OVERHEAD = 300;

await Promise.all(findFiles(root).map(async (file) => {
  const raw = await readFile(file);

  const brotli = await asyncBrotliCompress(raw, {
    params: {
      [CONST.BROTLI_PARAM_QUALITY]: CONST.BROTLI_MAX_QUALITY,
      [CONST.BROTLI_PARAM_SIZE_HINT]: raw.length,
    },
  });
  if (brotli.length + OVERHEAD < raw.length) {
    await writeFile(file + '.br', brotli);
  }

  const gzip = await asyncGzipCompress(raw, {
    level: CONST.Z_BEST_COMPRESSION,
  });
  if (gzip.length + OVERHEAD < raw.length) {
    await writeFile(file + '.gz', gzip);
  }
}));

function findFiles(p) {
  const result = [];
  findFilesR(p, result);
  return result;
}

function findFilesR(p, output) {
  const stat = statSync(p);
  if (stat.isDirectory()) {
    const contents = readdirSync(p);
    contents.forEach((file) => {
      findFilesR(join(p, file), output);
    });
  } else if (stat.isFile()) {
    output.push(p);
  }
}

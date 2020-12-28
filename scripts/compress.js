#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const brotliCompress = promisify(zlib.brotliCompress);
const gzipCompress = promisify(zlib.gzip);
const CONST = zlib.constants;

const root = process.argv[2];
if (!root) {
  throw new Error('No root directory given!');
}

const OVERHEAD = 300;

Promise.all(findFiles(root).map(async (file) => {
  const raw = await readFile(file);

  const brotli = await brotliCompress(raw, {
    params: {
      [CONST.BROTLI_PARAM_QUALITY]: CONST.BROTLI_MAX_QUALITY,
      [CONST.BROTLI_PARAM_SIZE_HINT]: raw.length,
    },
  });
  if (brotli.length + OVERHEAD < raw.length) {
    await writeFile(file + '.br', brotli);
  }

  const gzip = await gzipCompress(raw, {
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
  const stat = fs.statSync(p);
  if (stat.isDirectory()) {
    const contents = fs.readdirSync(p);
    contents.forEach((file) => {
      findFilesR(path.join(p, file), output);
    });
  } else if (stat.isFile()) {
    output.push(p);
  }
}

import { fileURLToPath } from 'node:url';
import { join, resolve, dirname } from 'node:path';
import {
  readFile,
  writeFile,
  stat,
  readdir,
  rm,
  copyFile,
  mkdir,
  constants as FS_CONST,
} from 'node:fs/promises';
import { brotliCompress, gzip, constants as ZLIB_CONST } from 'node:zlib';
import { promisify } from 'node:util';

const asyncBrotliCompress = promisify(brotliCompress);
const asyncGzipCompress = promisify(gzip);

const COMPRESSION_OVERHEAD = 300;

export const basedir = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);

export const log = (message) => {
  process.stderr.write(`${message}\n`);
};

export async function deleteDirectory(dir) {
  await rm(dir, { recursive: true, force: true, maxRetries: 3 });
}

export async function copy(from, to) {
  const s = await stat(from);
  if (s.isDirectory()) {
    await mkdir(to, { recursive: true });
    for (const file of await readdir(from)) {
      await copy(join(from, file), join(to, file));
    }
  } else if (s.isFile()) {
    await copyFile(from, to, FS_CONST.COPYFILE_EXCL);
  }
}

export async function findFiles(p) {
  const result = [];
  await findFilesR(p, result);
  return result;
}

async function findFilesR(p, output) {
  const s = await stat(p);
  if (s.isDirectory()) {
    for (const file of await readdir(p)) {
      await findFilesR(join(p, file), output);
    }
  } else if (s.isFile()) {
    output.push(p);
  }
}

export async function readJSON(path) {
  return JSON.parse(await readFile(path));
}

export async function writeNiceJSON(path, json) {
  await writeFile(path, JSON.stringify(json, undefined, 2));
}

export async function compressFile(file) {
  const raw = await readFile(file);
  const size = raw.length;
  let brSize = size;
  let gzSize = size;

  if (/\.(png|ico|woff2?)$/.test(file)) {
    // savings for these filetypes are minimal,
    // so save build time & artifact size by skipping them
    return { file, size, brSize, gzSize };
  }

  const brotli = await asyncBrotliCompress(raw, {
    params: {
      [ZLIB_CONST.BROTLI_PARAM_QUALITY]: ZLIB_CONST.BROTLI_MAX_QUALITY,
      [ZLIB_CONST.BROTLI_PARAM_SIZE_HINT]: raw.length,
    },
  });
  if (brotli.length + COMPRESSION_OVERHEAD < raw.length) {
    await writeFile(`${file}.br`, brotli);
    brSize = brotli.length;
  }

  const gzip = await asyncGzipCompress(raw, {
    level: ZLIB_CONST.Z_BEST_COMPRESSION,
  });
  if (gzip.length + COMPRESSION_OVERHEAD < raw.length) {
    await writeFile(`${file}.gz`, gzip);
    gzSize = gzip.length;
  }

  return { file, size, brSize, gzSize };
}

export const hasExt = (...exts) => ({ file }) => exts.some((ext) => file.endsWith(ext));

export const SIZE0 = { size: 0, brSize: 0, gzSize: 0 };

export const sumSize = (a, b) => ({
  size: a.size + b.size,
  brSize: a.brSize + b.brSize,
  gzSize: a.gzSize + b.gzSize,
});

export const printSize = ({ size, brSize, gzSize }) =>
  `${prettyBytes(size)} / ${prettyBytes(gzSize)} gzip / ${prettyBytes(brSize)} brotli`;

function prettyBytes(bytes) {
  if (bytes < 2000) {
    return `${bytes}B`.padStart(8, ' ');
  }
  return `${(bytes / 1024).toFixed(1)}kB`.padStart(8, ' ');
}

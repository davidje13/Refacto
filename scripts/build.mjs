#!/usr/bin/env node

import { join } from 'node:path';
import { chmod, rename } from 'node:fs/promises';
import {
  basedir,
  compressFile,
  deleteDirectory,
  findFiles,
  log,
  readJSON,
  writeNiceJSON,
  copy,
  sumSize,
  SIZE0,
  hasExt,
  printSize,
} from './helpers/io.mjs';
import { runMultipleTasks } from './helpers/proc.mjs';

const PARALLEL_BUILD = (process.env['PARALLEL_BUILD'] ?? 'true') === 'true';

const packages = [
  { name: 'frontend', pkg: '@refacto/frontend', format: '35' },
  { name: 'backend', pkg: '@refacto/backend', format: '36' },
];
const builddir = join(basedir, 'build');
const staticdir = join(builddir, 'static');
const resourcesdir = join(staticdir, 'resources');

await runMultipleTasks(
  packages.map(({ name, pkg, format }) => ({
    command: 'npm',
    args: ['run', 'build', '--workspace=' + pkg, '--quiet'],
    beginMessage: `Building ${name}...`,
    failureMessage: `Failed to build ${name}.`,
    outputPrefix: name,
    prefixFormat: format,
  })),
  { parallel: PARALLEL_BUILD },
);

await deleteDirectory(builddir);

log('Combining output...');
await copy(join(basedir, 'backend', 'build'), builddir);
await deleteDirectory(staticdir);
await copy(join(basedir, 'frontend', 'build'), resourcesdir);
await rename(join(resourcesdir, 'index.html'), join(staticdir, 'index.html'));
await chmod(join(builddir, 'index.js'), 0o755);
await copy(
  join(basedir, 'scripts', 'docker', 'Dockerfile'),
  join(builddir, 'Dockerfile'),
);
await copy(
  join(basedir, 'scripts', 'docker', '.dockerignore'),
  join(builddir, '.dockerignore'),
);

log('Compressing static resources...');
const staticFiles = await Promise.all(
  (await findFiles(resourcesdir)).map(compressFile),
);

const isCode = hasExt('.js', '.css', '.html');

const codeTotals = staticFiles.filter(isCode).reduce(sumSize, SIZE0);

const resourceTotals = staticFiles
  .filter((v) => !isCode(v))
  .reduce(sumSize, SIZE0);

log(`Frontend code size:     ${printSize(codeTotals)}`);
log(`Frontend resource size: ${printSize(resourceTotals)}`);

log('Generating package.json...');
const packageJson = await readJSON(join(basedir, 'backend', 'package.json'));
await writeNiceJSON(join(builddir, 'package.json'), {
  ...packageJson,
  name: 'refacto',
  scripts: { start: './index.js' },
  optionalDependencies: undefined,
  devDependencies: undefined,
});
await writeNiceJSON(join(builddir, 'package-lock.json'), {
  name: 'refacto',
  lockfileVersion: 3,
  requires: true,
  packages: { '': { name: 'refacto' } },
});

log('Build complete.');

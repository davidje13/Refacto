#!/usr/bin/env node

import { join } from 'node:path';
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
import { stat, rename, chmod } from 'node:fs/promises';
import { runMultipleTasks, runTask } from './helpers/proc.mjs';

const PARALLEL_BUILD = (process.env['PARALLEL_BUILD'] ?? 'true') === 'true';
const KEEP_DEPS = process.argv.slice(2).includes('--keep-deps');

const packages = [
  { dir: 'frontend', format: '35' },
  { dir: 'backend', format: '36' },
];
const builddir = join(basedir, 'build');
const staticdir = join(builddir, 'static');

await runTask({
  command: 'diff',
  args: [
    join(basedir, 'frontend', 'src', 'shared', 'api-entities.ts'),
    join(basedir, 'backend', 'src', 'shared', 'api-entities.ts'),
  ],
  outputMode: 'fail_atomic',
  failureMessage: 'Shared api-entities.ts files do not match.',
});

await runMultipleTasks(
  packages.map(({ dir, format }) => ({
    command: 'npm',
    args: ['run', 'build', '--quiet'],
    cwd: join(basedir, dir),
    beginMessage: `Building ${dir}...`,
    failureMessage: `Failed to build ${dir}.`,
    outputPrefix: dir,
    prefixFormat: format,
  })),
  { parallel: PARALLEL_BUILD },
);

let preserveBuildModules = false;
const buildModules = join(builddir, 'node_modules');
const tempBuildModules = join(basedir, 'build_node_modules');
if (KEEP_DEPS) {
  const buildModulesStat = await stat(buildModules).catch(() => null);
  if (buildModulesStat) {
    const buildPackageStat = await stat(
      join(basedir, 'backend', 'package.json'),
    );
    if (buildPackageStat.mtime.getTime() < buildModulesStat.ctime.getTime()) {
      preserveBuildModules = true;
    } else {
      log(
        'Deleting build/node_modules because backend/package.json has changed...',
      );
    }
  }
}

if (preserveBuildModules) {
  await rename(buildModules, tempBuildModules);
}

await deleteDirectory(builddir);

log('Combining output...');
await copy(join(basedir, 'backend', 'build'), builddir);
await deleteDirectory(staticdir);
await copy(join(basedir, 'frontend', 'build'), staticdir);
await chmod(join(builddir, 'index.js'), 0o755);
await copy(
  join(basedir, 'scripts', 'docker', 'Dockerfile'),
  join(builddir, 'Dockerfile'),
);

if (preserveBuildModules) {
  log('Restoring build/node_modules...');
  await rename(tempBuildModules, buildModules);
}

log('Compressing static resources...');
const staticFiles = await Promise.all(
  (await findFiles(staticdir)).map(compressFile),
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
  name: 'refacto-app',
  scripts: { start: './index.js' },
  optionalDependencies: undefined,
  devDependencies: undefined,
});
await copy(
  join(basedir, 'backend', 'package-lock.json'),
  join(builddir, 'package-lock.json'),
);

log('Build complete.');

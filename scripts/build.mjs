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
} from './helpers/io.mjs';
import { stat, rename, chmod } from 'node:fs/promises';
import { runTask, runTaskPrefixOutput } from './helpers/proc.mjs';

const PARALLEL_BUILD = process.env['PARALLEL_BUILD'] !== 'false';
const KEEP_DEPS = process.argv.slice(2).includes('--keep-deps');

const packages = ['frontend', 'backend'];
const builddir = join(basedir, 'build');
const staticdir = join(builddir, 'static');

try {
  await runTask('diff', [
    join(basedir, 'frontend', 'src', 'shared', 'api-entities.ts'),
    join(basedir, 'backend', 'src', 'shared', 'api-entities.ts'),
  ]);
} catch {
  log('Shared api-entities.ts files do not match.');
  process.exit(1);
}

async function buildPackage(pkg) {
  log(`Building ${pkg}...`);
  await runTaskPrefixOutput({
    command: 'npm',
    args: ['--prefix', join(basedir, pkg), 'run', 'build', '--quiet'],
    outputPrefix: pkg,
  });
}

try {
  if (PARALLEL_BUILD) {
    await Promise.all(packages.map(buildPackage));
  } else {
    for (const pkg of packages) {
      await buildPackage(pkg);
    }
  }
} catch {
  log('Build failed.');
  process.exit(1);
}

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

if (preserveBuildModules) {
  log('Restoring build/node_modules...');
  await rename(tempBuildModules, buildModules);
}

log('Compressing static resources...');
await Promise.all((await findFiles(staticdir)).map(compressFile));

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

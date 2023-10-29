#!/usr/bin/env node

import { join } from 'node:path';
import { basedir, deleteDirectory, log } from './helpers/io.mjs';

log('Cleaning build...');
await deleteDirectory(join(basedir, 'backend', 'build'));
await deleteDirectory(join(basedir, 'frontend', 'build'));
await deleteDirectory(join(basedir, 'e2e', 'build'));
await deleteDirectory(join(basedir, 'build'));

log('Cleaning dependencies...');
await deleteDirectory(join(basedir, 'backend', 'node_modules'));
await deleteDirectory(join(basedir, 'frontend', 'node_modules'));
await deleteDirectory(join(basedir, 'e2e', 'node_modules'));

log('Cleaning complete.');

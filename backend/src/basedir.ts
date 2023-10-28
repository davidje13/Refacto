import { dirname } from 'node:path';

// This file exists to get a consistent directory before
// and after building.

// (without this hack, it is impossible to get a consistent
// relative directory name in any non-root-directory script)

export const basedir = dirname(new URL(import.meta.url).pathname);

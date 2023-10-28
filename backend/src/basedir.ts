import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

// This file exists to get a consistent directory before
// and after building.

// (without this hack, it is impossible to get a consistent
// relative directory name in any non-root-directory script)

export const basedir = dirname(fileURLToPath(import.meta.url));

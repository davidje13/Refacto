// This file exists to work around a bug in webpack:
// https://github.com/webpack/webpack/issues/4303

// (without this hack, it is impossible to get a consistent
// relative __dirname in any non-root-directory script)

import { dirname } from 'node:path';

export const basedir = dirname(new URL(import.meta.url).pathname);

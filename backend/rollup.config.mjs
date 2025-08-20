import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: 'src/index.ts',
    output: {
      // TODO replace express with something else to be able to add --disallow-code-generation-from-strings
      banner: '#!/usr/bin/env -S node --disable-proto delete\n',
      file: 'build/index.js',
      format: 'cjs', // TODO: switch to esm / mjs
    },
    external: [/node_modules/],
    plugins: [nodeResolve(), typescript()],
  },
];

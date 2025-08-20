import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { BUILD_RUNTIME_FLAGS } from '../scripts/helpers/flags.mjs';

export default [
  {
    input: 'src/index.ts',
    output: {
      banner: `#!/usr/bin/env -S node ${BUILD_RUNTIME_FLAGS.join(' ')}\n`,
      file: 'build/index.js',
      format: 'cjs', // TODO: switch to esm / mjs
    },
    watch: {
      buildDelay: 500,
      clearScreen: false,
    },
    external: [/node_modules/],
    plugins: [nodeResolve(), typescript()],
  },
];

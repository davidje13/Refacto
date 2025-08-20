import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { BUILD_RUNTIME_FLAGS } from '../scripts/helpers/flags.mjs';

const NODEJS = [
  /^node:.*/,
  /^(assert|buffer|child_process|crypto|dns|events|fs|https?|net|os|path|process|stream|string_decoder|timers|tls|tty|url|util|zlib)(\/promises)?$/,
];

export default [
  // Step 1: bundle + minify sources
  {
    input: 'src/index.ts',
    output: { file: 'build/index.js', format: 'esm' },
    watch: {
      buildDelay: 500,
      clearScreen: false,
    },
    external: [...NODEJS, /\/node_modules\//],
    plugins: [
      nodeResolve({ preferBuiltins: false }),
      typescript({ tslib: {} }),
      terser(),
    ],
  },

  // Step 2: bundle dependencies and perform basic minification
  {
    input: 'build/index.js',
    output: {
      banner: (chunk) =>
        chunk.isEntry
          ? `#!/usr/bin/env -S node ${BUILD_RUNTIME_FLAGS.join(' ')}\n`
          : '',
      dir: 'build',
      format: 'esm',
    },
    watch: false,
    external: NODEJS,
    plugins: [
      commonjs(),
      replace({
        // disable ws optional imports
        include: ['node_modules/ws/**'],
        preventAssignment: true,
        values: {
          'process.env.WS_NO_BUFFER_UTIL': 'true', // performance boosting library is potentially unsafe
          'process.env.WS_NO_UTF_8_VALIDATE': 'true', // not required in Node.js 18+
        },
      }),
      json({ compact: true, namedExports: true, preferConst: true }),
      nodeResolve({ preferBuiltins: false }),
      terser(), // must not mangle
    ],

    onwarn(warning, warn) {
      if (warning.code === 'CIRCULAR_DEPENDENCY') {
        const ids = warning.ids.map((id) =>
          id.substring(id.lastIndexOf('node_modules') + 13),
        );
        if (!SAFE_CIRCULAR_DEPENDENCIES.some((known) => match(ids, known))) {
          console.warn('circular dependency: ' + ids.join(' -> '));
        }
      } else {
        warn(warning);
      }
    },
  },
];

function match(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

// these known circular dependencies in third-party libraries have been manually checked
// to confirm they do not introduce any issues, so the warnings for them are silenced
const SAFE_CIRCULAR_DEPENDENCIES = [
  // pg
  ['pg/lib/index.js', 'pg-pool/index.js', 'pg/lib/index.js'],

  // mongodb
  [
    'mongodb/lib/utils.js',
    'mongodb/lib/write_concern.js',
    'mongodb/lib/cmap/wire_protocol/responses.js',
    'mongodb/lib/utils.js',
  ],
  [
    'mongodb/lib/change_stream.js',
    'mongodb/lib/collection.js',
    'mongodb/lib/change_stream.js',
  ],
  [
    'mongodb/lib/collection.js',
    'mongodb/lib/operations/rename.js',
    'mongodb/lib/collection.js',
  ],
  [
    'mongodb/lib/change_stream.js',
    'mongodb/lib/cursor/change_stream_cursor.js',
    'mongodb/lib/change_stream.js',
  ],
  [
    'mongodb/lib/change_stream.js',
    'mongodb/lib/db.js',
    'mongodb/lib/change_stream.js',
  ],
  [
    'mongodb/lib/index.js',
    'mongodb/lib/change_stream.js',
    'mongodb/lib/db.js',
    'mongodb/lib/operations/drop.js',
    'mongodb/lib/index.js',
  ],
  [
    'mongodb/lib/index.js',
    'mongodb/lib/change_stream.js',
    'mongodb/lib/mongo_client.js',
    'mongodb/lib/index.js',
  ],
  [
    'mongodb/lib/change_stream.js',
    'mongodb/lib/mongo_client.js',
    'mongodb/lib/change_stream.js',
  ],
  [
    'mongodb-connection-string-url/lib/index.js',
    'mongodb-connection-string-url/lib/redact.js',
    'mongodb-connection-string-url/lib/index.js',
  ],
  [
    'mongodb/lib/cmap/wire_protocol/compression.js',
    'mongodb/lib/cmap/commands.js',
    'mongodb/lib/cmap/wire_protocol/compression.js',
  ],
  [
    'mongodb/lib/mongo_client.js',
    'mongodb/lib/connection_string.js',
    'mongodb/lib/encrypter.js',
    'mongodb/lib/client-side-encryption/auto_encrypter.js',
    'mongodb/lib/mongo_client.js',
  ],
  [
    'mongodb/lib/client-side-encryption/client_encryption.js',
    'mongodb/lib/client-side-encryption/state_machine.js',
    'mongodb/lib/client-side-encryption/client_encryption.js',
  ],
  [
    'mongodb/lib/mongo_client.js',
    'mongodb/lib/connection_string.js',
    'mongodb/lib/encrypter.js',
    'mongodb/lib/mongo_client.js',
  ],
  [
    'mongodb/lib/mongo_client.js',
    'mongodb/lib/connection_string.js',
    'mongodb/lib/mongo_client.js',
  ],
  [
    'mongodb/lib/sdam/monitor.js',
    'mongodb/lib/sdam/server.js',
    'mongodb/lib/sdam/monitor.js',
  ],
  [
    'mongodb/lib/cmap/auth/mongodb_oidc.js',
    'mongodb/lib/cmap/auth/mongodb_oidc/automated_callback_workflow.js',
    'mongodb/lib/cmap/auth/mongodb_oidc.js',
  ],
  [
    'mongodb/lib/index.js',
    'mongodb/lib/change_stream.js',
    'mongodb/lib/mongo_client.js',
    'mongodb/lib/operations/client_bulk_write/executor.js',
    'mongodb/lib/operations/client_bulk_write/results_merger.js',
    'mongodb/lib/index.js',
  ],

  // ioredis
  [
    'ioredis/built/Redis.js',
    'ioredis/built/cluster/index.js',
    'ioredis/built/Redis.js',
  ],
  [
    'ioredis/built/Redis.js',
    'ioredis/built/cluster/index.js',
    'ioredis/built/cluster/ClusterSubscriber.js',
    'ioredis/built/Redis.js',
  ],
  [
    'ioredis/built/Redis.js',
    'ioredis/built/cluster/index.js',
    'ioredis/built/cluster/ConnectionPool.js',
    'ioredis/built/Redis.js',
  ],
  [
    'ioredis/built/Redis.js',
    'ioredis/built/cluster/index.js',
    'ioredis/built/cluster/ClusterSubscriberGroup.js',
    'ioredis/built/cluster/ShardedSubscriber.js',
    'ioredis/built/Redis.js',
  ],
  [
    'ioredis/built/Redis.js',
    'ioredis/built/connectors/index.js',
    'ioredis/built/connectors/SentinelConnector/index.js',
    'ioredis/built/Redis.js',
  ],
];

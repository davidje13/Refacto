const COMMON_FLAGS = [
  // TODO: enabling --permission seems risky:
  // https://nodejs.org/docs/latest/api/permissions.html#permission-model-constraints
  // "OpenSSL engines cannot be requested at runtime when the Permission Model is enabled, affecting the built-in crypto, https, and tls modules"
  // Likely to affect tokens and DB access? Can this be fixed by setting up --openssl-config correctly?
  // Also "Run-Time Loadable Extensions cannot be loaded when the Permission Model is enabled, affecting the sqlite module."
  // Could the limits be OS-dependent?
  //'--permission',
  //'--allow-fs-read=./*', // permissions model: required to load sources + static files. TODO: should be relative to script, not CWD (see https://github.com/nodejs/node/issues/59820)
  '--force-node-api-uncaught-exceptions-policy',
  '--no-addons',
  '--disallow-code-generation-from-strings',
];

export const BUILD_RUNTIME_FLAGS = [...COMMON_FLAGS, '--disable-proto=delete'];

export const LOCAL_RUNTIME_FLAGS = [
  ...COMMON_FLAGS,
  '--disable-proto=throw',
  '--pending-deprecation',
  //'--allow-child-process', // permissions model: required for rollup's watch mode. TODO: suppress warning (see https://github.com/nodejs/node/issues/59818)
];

export const TEST_RUNTIME_FLAGS = [
  ...LOCAL_RUNTIME_FLAGS,
  '--throw-deprecation',
];

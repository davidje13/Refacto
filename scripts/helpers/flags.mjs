const COMMON_FLAGS = [
  '--force-node-api-uncaught-exceptions-policy',
  '--no-addons',

  // TODO replace express with something else to be able to add these:
  //'--disallow-code-generation-from-strings',
  //'--frozen-intrinsics',
];

export const BUILD_RUNTIME_FLAGS = [...COMMON_FLAGS, '--disable-proto=delete'];

export const LOCAL_RUNTIME_FLAGS = [
  ...COMMON_FLAGS,
  '--disable-proto=throw',
  '--pending-deprecation',
];

export const TEST_RUNTIME_FLAGS = [
  ...LOCAL_RUNTIME_FLAGS,

  // TODO: find what is bringing in node:punycode module
  //'--throw-deprecation',
];

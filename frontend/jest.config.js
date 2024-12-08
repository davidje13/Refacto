// If this file is .mjs it triggers a warning in Node 23:
// ExperimentalWarning: CommonJS module .../jest-util/build/requireOrImportModule.js is loading ES Module .../jest.config.mjs using require().

module.exports = {
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/src/test-helpers/svgr.ts',
    '\\.(less|png|woff2?)$': '<rootDir>/src/test-helpers/resource.ts',
  },
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: ['/node_modules/(?!wouter)'], // https://github.com/molefrog/wouter/issues/415
  testEnvironment: './src/test-helpers/patched-jsdom.ts',
  setupFilesAfterEnv: ['<rootDir>/src/test-helpers/entrypoint.ts'],
};

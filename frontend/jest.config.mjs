export default {
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/src/test-helpers/svgr.ts',
    '\\.(less|png|woff2?)$': '<rootDir>/src/test-helpers/resource.ts',
  },
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
  },
  testEnvironment: './src/test-helpers/patched-jsdom.ts',
  setupFilesAfterEnv: ['<rootDir>/src/test-helpers/entrypoint.ts'],
};

module.exports = {
  options: {
    tests: 'src',
  },
  use: [
    ['@neutrinojs/airbnb', {
      eslint: {
        rules: {
          // All sources are test-related, so devDependencies are OK
          'import/no-extraneous-dependencies': ['error', {
            'devDependencies': true,
          }],
        }
      },
    }],
    '@neutrinojs/jest',
    '@neutrinojs/node',
  ],
};

module.exports = {
  options: {
    tests: 'src',
  },
  use: [
    ['@neutrinojs/airbnb', {
      eslint: {
        rules: {
          'arrow-parens': ['error', 'always'],
        },
      },
    }],
    '@neutrinojs/jest',
    '@neutrinojs/node',
  ],
};

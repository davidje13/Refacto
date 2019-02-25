module.exports = {
  options: {
    tests: 'src',
  },
  use: [
    ['@neutrinojs/airbnb', {
      eslint: {
        rules: {
          'arrow-parens': ['error', 'always'],
          'operator-linebreak': ['error', 'after'],
        },
      },
    }],
    ['@neutrinojs/copy', {
      patterns: [{
        context: 'src/static',
        from: '**/*',
        to: 'static',
      }],
    }],
    '@neutrinojs/jest',
    '@neutrinojs/node',
  ],
};

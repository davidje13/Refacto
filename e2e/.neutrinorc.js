const { baseRules, testRules } = require('../eslint.js');

module.exports = {
  options: {
    tests: 'src',
  },
  use: [
    ['@neutrinojs/airbnb', {
      eslint: {
        // All sources are test-related
        rules: Object.assign({}, baseRules, testRules),
        baseConfig: {
          extends: [
            'plugin:eslint-comments/recommended',
          ],
        },
      },
    }],
    ['@neutrinojs/jest', {
      bail: true,
    }],
    ['@neutrinojs/node', {
      babel: {
        presets: [
          ['@babel/preset-env', {
            useBuiltIns: 'usage',
            corejs: 3,
            targets: {
              node: 'current',
            },
          }],
        ],
      },
    }],
  ],
};

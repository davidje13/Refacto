const airbnb = require('@neutrinojs/airbnb');
const jest = require('@neutrinojs/jest');
const node = require('@neutrinojs/node');
const { baseRules, testRules } = require('../eslint.js');

module.exports = {
  options: {
    tests: 'src',
  },
  use: [
    airbnb({
      eslint: {
        // All sources are test-related
        rules: Object.assign({}, baseRules, testRules),
        baseConfig: {
          extends: [
            'plugin:eslint-comments/recommended',
          ],
        },
      },
    }),
    jest({
      bail: true,
    }),
    node({
      babel: {
        presets: [
          ['@babel/preset-env', {
            targets: {
              node: 'current',
            },
          }],
        ],
      },
    }),
  ],
};

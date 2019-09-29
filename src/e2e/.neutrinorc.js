const airbnb = require('@neutrinojs/airbnb-base');
const jest = require('@neutrinojs/jest');
const node = require('@neutrinojs/node');
const typescript = require('neutrino-typescript');
const typescriptLint = require('neutrino-typescript-eslint');
const { baseRules, testRules } = require('../eslint.js');

module.exports = {
  options: {
    tests: 'src',
  },
  use: [
    typescript(),
    typescriptLint(),
    airbnb({
      eslint: {
        // All sources are test-related
        rules: Object.assign({}, baseRules, testRules, {
          '@typescript-eslint/no-floating-promises': ['error'],
        }),
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

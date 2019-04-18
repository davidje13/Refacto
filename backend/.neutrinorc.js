const airbnb = require('@neutrinojs/airbnb');
const copy = require('@neutrinojs/copy');
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
        rules: baseRules,
        baseConfig: {
          extends: [
            'plugin:eslint-comments/recommended',
          ],
          overrides: [{
            files: ['**/test-helpers/*'],
            rules: testRules,
          }],
        },
      },
    }),
    copy({
      patterns: [{
        context: 'src/static',
        from: '**/*',
        to: 'static',
      }],
    }),
    jest(),
    node({
      babel: {
        presets: [
          ['@babel/preset-env', {
            useBuiltIns: 'usage',
            corejs: 3,
            targets: {
              node: '10.15',
            },
          }],
        ],
      },
    }),
    (neutrino) => neutrino.config.stats('minimal'),
  ],
};

// known issue: multiple rebuilds on 'npm start' due to:
// https://github.com/webpack/webpack/issues/2983

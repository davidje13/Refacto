const airbnb = require('@neutrinojs/airbnb');
const copy = require('@neutrinojs/copy');
const jest = require('@neutrinojs/jest');
const node = require('@neutrinojs/node');
const { baseRules, testRules, tsRules } = require('../eslint.js');
const { typescriptBefore, typescriptAfter } = require('./neutrino-typescript');

module.exports = {
  options: {
    tests: 'src',
  },
  use: [
    typescriptBefore(),
    (neutrino) => neutrino.use(airbnb({
      eslint: {
        rules: Object.assign({}, baseRules, tsRules),
        baseConfig: {
          extends: [
            'plugin:eslint-comments/recommended',
          ],
          overrides: [{
            files: ['**/test-helpers/*', '**/*.test.*'],
            rules: Object.assign({}, tsRules, testRules),
          }],
        },
      },
    })),
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
            targets: {
              node: '10.15',
            },
          }],
        ],
        plugins: [
          'transform-dynamic-import',
        ],
      },
    }),
    typescriptAfter(),
    (neutrino) => neutrino.config.stats('minimal'),
  ],
};

// known issue: multiple rebuilds on 'npm start' due to:
// https://github.com/webpack/webpack/issues/2983

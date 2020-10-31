const airbnb = require('@neutrinojs/airbnb-base');
const copy = require('@neutrinojs/copy');
const jest = require('@neutrinojs/jest');
const node = require('@neutrinojs/node');
const typescript = require('neutrinojs-typescript');
const typescriptLint = require('neutrinojs-typescript-eslint');
const { baseRules, testRules } = require('../eslint.js');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  options: {
    tests: 'src',
  },
  use: [
    typescript({ tsconfig: {
      compilerOptions: {
        strict: true,
      },
    } }),
    typescriptLint(),
    airbnb({
      eslint: {
        rules: baseRules,
        baseConfig: {
          extends: [
            'plugin:eslint-comments/recommended',
          ],
          overrides: [{
            files: ['**/test-helpers/*', '**/*.test.*'],
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
            targets: {
              node: '14',
            },
          }],
        ],
        plugins: [
          'transform-dynamic-import',
        ],
      },
    }),
    (neutrino) => neutrino.config.externals([nodeExternals({ whitelist: [/^webpack/, /^refacto-entities$/] })]),
    (neutrino) => neutrino.config.stats('minimal'),
  ],
};

// known issue: multiple rebuilds on 'npm start' due to:
// https://github.com/webpack/webpack/issues/2983

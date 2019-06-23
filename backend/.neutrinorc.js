const airbnb = require('@neutrinojs/airbnb');
const copy = require('@neutrinojs/copy');
const jest = require('@neutrinojs/jest');
const node = require('@neutrinojs/node');
const { baseRules, testRules, tsRules } = require('../eslint.js');

const typescript = () => (neutrino) => {
  const { extensions } = neutrino.options;
  const index = extensions.indexOf('js');
  extensions.splice(index, 0, 'ts', 'tsx');
  neutrino.options.extensions = extensions;
};

module.exports = {
  options: {
    tests: 'src',
  },
  use: [
    typescript(),
    (neutrino) => neutrino.use(airbnb({
      eslint: {
        parser: '@typescript-eslint/parser',
        parserOptions: {
          project: './tsconfig.json',
        },
        plugins: ['@typescript-eslint'],
        rules: Object.assign({}, baseRules, tsRules),
        baseConfig: {
          extends: [
            'plugin:eslint-comments/recommended',
            'plugin:@typescript-eslint/eslint-recommended',
            'plugin:@typescript-eslint/recommended',
          ],
          overrides: [{
            files: ['**/test-helpers/*', '**/*.test.*'],
            rules: Object.assign({}, tsRules, testRules),
          }],
          settings: {
            'import/resolver': {
              node: {
                extensions: neutrino.options.extensions.map((ext) => `.${ext}`),
              },
            },
          },
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
          ['@babel/preset-typescript', {}],
        ],
        plugins: [
          'transform-dynamic-import',
        ],
      },
    }),
    (neutrino) => neutrino.config.stats('minimal'),
  ],
};

// known issue: multiple rebuilds on 'npm start' due to:
// https://github.com/webpack/webpack/issues/2983

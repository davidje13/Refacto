const airbnb = require('@neutrinojs/airbnb');
const copy = require('@neutrinojs/copy');
const jest = require('@neutrinojs/jest');
const react = require('@neutrinojs/react');
const styleMinify = require('@neutrinojs/style-minify');
const typescript = require('neutrino-typescript');
const typescriptLint = require('neutrino-typescript-eslint');
const { baseRules, reactRules, testRules } = require('../eslint.js');

const conditionalModule = (pred, mod) => (neutrino) => {
  if (pred(neutrino)) {
    neutrino.use(mod);
  }
};

module.exports = {
  options: {
    tests: 'src',
  },
  use: [
    typescript(),
    typescriptLint(),
    // exclude linting from development as it is very buggy (lots of false
    // positives) when used with webpack dev server, but works fine in
    // isolation
    conditionalModule(() => process.env.NODE_ENV !== 'development', airbnb({
      eslint: {
        rules: { ...baseRules, ...reactRules },
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
    })),
    copy({
      patterns: [{
        context: 'src/resources/assets',
        from: '**/*',
        to: 'assets',
      }],
    }),
    jest({
      setupFilesAfterEnv: ['<rootDir>/src/test-helpers/entrypoint.ts'],
    }),
    (neutrino) => neutrino.use(react({
      html: {
        template: 'src/resources/html-template.ejs',
        favicon: 'src/resources/favicon.png',
        title: 'Refacto',
      },
      devServer: {
        port: process.env.PORT || 5000,
        inline: false, // disable hot reloading
      },
      babel: {
        presets: [
          ['@babel/preset-env', {
//            debug: true,
            targets: {
              browsers: [
                'last 1 chrome version',
                'last 1 firefox version',
                'last 1 ios version',
//                'last 1 edge version',
//                'last 1 safari version',
              ],
            },

            // corejs is not actually used;
            // this config forces build errors if a polyfil is required:
            // feature request: https://github.com/babel/babel/issues/11379
            useBuiltIns: 'usage',
            corejs: 3,
            exclude: [
              // false positives:
              'web.dom-collections.iterator', // other array types
              'es.string.replace',            // unused flag 's'
              'web.url',                      // unused URL.methods
              'es.typed-array.uint8-array',   // unused UInt8Array constructors
            ],
          }],
        ],
        plugins: [
          ['@babel/plugin-transform-runtime', {
            version: '^' + neutrino.getDependencyVersion('@babel/runtime').version,
          }],
        ],
      },
      style: {
        test: /\.(css|less)$/,
        modulesTest: /\.module\.(css|less)$/,
        loaders: [
          {
            loader: 'less-loader',
            useId: 'less',
            options: {
              sourceMap: true,
              lessOptions: {
                math: 'strict',
                strictUnits: true,
              },
            },
          },
        ],
      },
    })),
    conditionalModule(() => process.env.NODE_ENV !== 'development', styleMinify()),
    (neutrino) => neutrino.config.stats('minimal'),
  ],
};

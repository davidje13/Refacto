const airbnb = require('@neutrinojs/airbnb');
const copy = require('@neutrinojs/copy');
const jest = require('@neutrinojs/jest');
const react = require('@neutrinojs/react');
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
        plugins: [
          'react-hooks',
        ],
        rules: Object.assign({}, baseRules, reactRules),
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
        context: 'src/static',
        from: '**/*',
        to: 'static',
      }],
    }),
    jest({
      setupFilesAfterEnv: ['<rootDir>/src/test-helpers/entrypoint'],
    }),
    react({
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
//                'last 1 firefox version',
//                'last 1 edge version',
//                'last 1 safari version',
              ],
            },
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
              sourcemap: true,
            },
          },
        ],
      },
    }),
    (neutrino) => neutrino.config.stats('minimal'),
  ],
};

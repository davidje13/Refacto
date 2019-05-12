const airbnb = require('@neutrinojs/airbnb');
const copy = require('@neutrinojs/copy');
const jest = require('@neutrinojs/jest');
const react = require('@neutrinojs/react');
const { baseRules, reactRules, testRules } = require('../eslint.js');

const linter = airbnb({
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
        files: ['**/test-helpers/*'],
        rules: testRules,
      }],
    },
  },
});

module.exports = {
  options: {
    tests: 'src',
  },
  use: [
    (neutrino) => {
      // exclude linting from development as it is very buggy (lots of false
      // positives) when used with webpack dev server, but works fine in
      // isolation
      if (process.env.NODE_ENV !== 'development') {
        neutrino.use(linter);
      }
    },
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
        plugins: [
          '@babel/plugin-proposal-optional-chaining',
        ],
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

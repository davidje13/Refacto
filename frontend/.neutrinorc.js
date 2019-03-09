const { baseRules, reactRules, testRules } = require('../eslint.js');

const linter = ['@neutrinojs/airbnb', {
  eslint: {
    rules: Object.assign({}, baseRules, reactRules),
    baseConfig: {
      overrides: [{
        files: ['**/test-helpers/*'],
        rules: testRules,
      }],
    },
  },
}];

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
    ['@neutrinojs/copy', {
      patterns: [{
        context: 'src/static',
        from: '**/*',
        to: 'static',
      }],
    }],
    ['@neutrinojs/jest', {
      setupTestFrameworkScriptFile: '<rootDir>/src/test-helpers/entrypoint',
    }],
    ['@neutrinojs/react', {
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
    }],
    (neutrino) => neutrino.config.stats('minimal'),
  ],
};

const linter = ['@neutrinojs/airbnb', {
  eslint: {
    rules: {
      'arrow-parens': ['error', 'always'],
      'import/no-named-as-default': ['off'], // conflicts with redux convention
      'jsx-a11y/anchor-is-valid': ['error', {
        'components': ['Link'],
        'specialLink': ['to'],
      }],
      'operator-linebreak': ['error', 'after'],
      'react/destructuring-assignment': ['off'], // conflicts with redux actions
      'react/jsx-one-expression-per-line': ['off'], // too buggy
    },
    baseConfig: {
      overrides: [{
        files: ['**/test-helpers/*'],
        rules: {
          'import/no-extraneous-dependencies': ['error', {
            'devDependencies': true,
          }],
        },
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

module.exports = {
  options: {
    tests: 'src',
  },
  use: [
    ['@neutrinojs/airbnb', {
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
    }],
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
    }],
  ],
};

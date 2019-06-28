const merge = require('deepmerge');

module.exports = {
  typescriptBefore: () => (neutrino) => {
    const { extensions } = neutrino.options;
    const index = extensions.indexOf('js');
    extensions.splice(index, 0, 'ts', 'tsx');
    neutrino.options.extensions = extensions;
  },

  typescriptAfter: () => (neutrino) => {
    neutrino.config.module.rule('compile').use('babel').tap((options) => {
      options.presets.push(['@babel/preset-typescript', {}]);
      options.plugins.push(['@babel/plugin-proposal-class-properties', {}]);
      options.plugins.push(['@babel/plugin-proposal-object-rest-spread', {}]);
      return options;
    });

    const lintRule = neutrino.config.module.rule('lint');
    if (lintRule) {
      lintRule.use('eslint').tap((lintOptions) =>
        lintOptions.useEslintrc ? lintOptions : merge(lintOptions, {
          parser: '@typescript-eslint/parser',
          parserOptions: {
            project: './tsconfig.json',
          },
          plugins: ['@typescript-eslint'],
          baseConfig: {
            extends: [
              'plugin:@typescript-eslint/eslint-recommended',
              'plugin:@typescript-eslint/recommended',
            ],
            settings: {
              'import/resolver': {
                node: {
                  extensions: neutrino.options.extensions.map((ext) => `.${ext}`),
                },
              },
            },
          },
        })
      );
    }
  },
};

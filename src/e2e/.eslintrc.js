const typescriptEslintConverter = require('typescript-eslint-converter');
const { baseRules, testRules } = require('../eslint.js');

module.exports = typescriptEslintConverter({
  plugins: ['jest'],
  extends: ['airbnb-base', 'plugin:jest/recommended', 'plugin:eslint-comments/recommended'],
  rules: {
    ...baseRules,
    ...testRules, // All sources are test-related
    '@typescript-eslint/no-floating-promises': ['error'],
  },
});

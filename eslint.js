// These options are imported by each subproject's .neutrinorc.js file and used
// to configure the linter. This builds on top of the airbnb standard rules.

module.exports = {
  baseRules: {
    'arrow-parens': ['error', 'always'],
    'operator-linebreak': ['error', 'after'],
  },

  reactRules: {
    'import/no-named-as-default': ['off'], // conflicts with redux convention
    'jsx-a11y/anchor-is-valid': ['error', {
      'components': ['Link'],
      'specialLink': ['to'],
    }],
    'jsx-a11y/no-autofocus': ['error', {
      'ignoreNonDOM': false,
    }],
    'react/jsx-one-expression-per-line': ['off'], // too buggy
  },

  testRules: {
    'import/no-extraneous-dependencies': ['error', {
      'devDependencies': true,
    }],
  },
};

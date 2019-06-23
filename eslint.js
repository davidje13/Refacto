// These options are imported by each subproject's .neutrinorc.js file and used
// to configure the linter. This builds on top of the airbnb standard rules.

module.exports = {
  baseRules: {
    'arrow-parens': ['error', 'always'],
    'operator-linebreak': ['error', 'after'],
  },

  tsRules: {
    '@typescript-eslint/indent': ['error', 2],
    '@typescript-eslint/await-thenable': ['error'],
    '@typescript-eslint/ban-ts-ignore': ['error'],
    '@typescript-eslint/func-call-spacing': ['error'],
    '@typescript-eslint/member-ordering': ['error'],
//    '@typescript-eslint/no-floating-promises': ['error'],
    '@typescript-eslint/no-for-in-array': ['error'],
    '@typescript-eslint/no-require-imports': ['error'],
    '@typescript-eslint/no-this-alias': ['error'],
    '@typescript-eslint/no-unnecessary-qualifier': ['error'],
    '@typescript-eslint/no-unnecessary-type-assertion': ['error'],
    '@typescript-eslint/no-useless-constructor': ['error'],
    '@typescript-eslint/prefer-function-type': ['error'],
    '@typescript-eslint/prefer-includes': ['error'],
    '@typescript-eslint/prefer-regexp-exec': ['error'],
    '@typescript-eslint/prefer-string-starts-ends-with': ['error'],
    '@typescript-eslint/require-array-sort-compare': ['error'],
    '@typescript-eslint/restrict-plus-operands': ['error'],
    '@typescript-eslint/unbound-method': ['error'],
    '@typescript-eslint/explicit-function-return-type': ['error'],
    '@typescript-eslint/no-parameter-properties': ['error', {
      'allows': ['private readonly'],
    }],
  },

  reactRules: {
    'jsx-a11y/anchor-is-valid': ['error', {
      'components': ['Link'],
      'specialLink': ['to'],
    }],
    'jsx-a11y/no-autofocus': ['error', {
      'ignoreNonDOM': false,
    }],
    'react/jsx-one-expression-per-line': ['off'], // too buggy
    'react-hooks/rules-of-hooks': ['error'],

    // https://github.com/evcohen/eslint-plugin-jsx-a11y/issues/455#issuecomment-403105932
    'jsx-a11y/label-has-associated-control': ['error', { depth: 2 }],
    'jsx-a11y/label-has-for': ['off'],

    // https://github.com/facebook/react/issues/14920#issuecomment-471328990
    'react-hooks/exhaustive-deps': ['off'], // does not support spread yet
  },

  testRules: {
    'import/no-extraneous-dependencies': ['error', {
      'devDependencies': true,
    }],
    '@typescript-eslint/explicit-function-return-type': ['off'],
  },
};

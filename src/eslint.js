// These options are imported by each subproject's .neutrinorc.js file and used
// to configure the linter. This builds on top of the airbnb standard rules.

module.exports = {
  baseRules: {
    'arrow-parens': ['error', 'always'],
    'operator-linebreak': ['error', 'after'],
    'no-void': ['error', { allowAsStatement: true }],
    'import/no-extraneous-dependencies': ['error', {
      'optionalDependencies': true,
    }],
    '@typescript-eslint/indent': ['error', 2],
    '@typescript-eslint/await-thenable': ['error'],
    '@typescript-eslint/member-ordering': ['error'],
    '@typescript-eslint/no-floating-promises': ['error'],
    '@typescript-eslint/no-for-in-array': ['error'],
    '@typescript-eslint/no-namespace': ['error', { allowDeclarations: true }],
    '@typescript-eslint/no-require-imports': ['error'],
    '@typescript-eslint/no-this-alias': ['error'],
    '@typescript-eslint/no-unnecessary-qualifier': ['error'],
    '@typescript-eslint/no-unnecessary-type-assertion': ['error'],
    '@typescript-eslint/prefer-function-type': ['error'],
    '@typescript-eslint/prefer-includes': ['error'],
    '@typescript-eslint/prefer-regexp-exec': ['error'],
    '@typescript-eslint/prefer-string-starts-ends-with': ['error'],
    '@typescript-eslint/require-array-sort-compare': ['error', { ignoreStringArrays: true }],
    '@typescript-eslint/restrict-plus-operands': ['error'],
    '@typescript-eslint/unbound-method': ['error'],
    '@typescript-eslint/explicit-function-return-type': ['error', {
      'allowTypedFunctionExpressions': true,
      'allowHigherOrderFunctions': true,
    }],
    '@typescript-eslint/no-parameter-properties': ['error', {
      'allows': ['private readonly', 'protected readonly'],
    }],
    '@typescript-eslint/no-non-null-assertion': ['off'],
    '@typescript-eslint/no-explicit-any': ['off'],
    'max-classes-per-file': ['error', 5],
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
    'react/jsx-fragments': ['error', 'element'],
    'react/jsx-props-no-spreading': ['off'],

    'react/prop-types': ['off'],
    'react/require-default-props': ['off'],

    // https://github.com/evcohen/eslint-plugin-jsx-a11y/issues/455#issuecomment-403105932
    'jsx-a11y/label-has-associated-control': ['error', {
      depth: 2,
      controlComponents: ['Input', 'SlugEntry'],
    }],
    'jsx-a11y/label-has-for': ['off'],

    // https://github.com/facebook/react/issues/14920#issuecomment-471328990
    'react-hooks/exhaustive-deps': ['off'], // does not support spread yet
    'react-hooks/rules-of-hooks': ['off'], // does not recognise functions passed to HOCs
  },

  testRules: {
    'import/no-extraneous-dependencies': ['error', {
      'devDependencies': true,
    }],
    'jest/no-mocks-import': ['off'],
    'jest/expect-expect': ['off'],
  },
};

module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import', 'tailwindcss', '@tanstack/query'],
  extends: [
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@next/next/recommended',
    'prettier',
  ],
  overrides: [
    {
      files: ['./pages/**/*.tsx', './pages/api/v1/**/*.ts'],
      rules: {
        'import/no-anonymous-default-export': 'off',
      },
    },
    {
      files: ['./pages/**/*.tsx', './pages/api/v1/**/*.ts', './utils/*.ts'],
      rules: {
        '@typescript-eslint/no-restricted-imports': 'off',
      },
    },
  ],
  rules: {
    'react/react-in-jsx-scope': 0,
    'react/display-name': 0,
    'react/prop-types': 0,
    'no-restricted-imports': 'off',
    '@typescript-eslint/no-restricted-imports': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/member-delimiter-style': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-unused-vars': [
      2,
      {
        argsIgnorePattern: '^_',
      },
    ],
    'import/no-extraneous-dependencies': 'off',
    'import/no-default-export': 'warn',
    'import/no-anonymous-default-export': [
      'error',
      {
        allowArray: true,
        allowObject: true,
      },
    ],
    'import/no-useless-path-segments': 'error',
    'import/order': [
      'error',
      {
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        'newlines-between': 'always',
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
      },
    ],
    '@typescript-eslint/no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['**/typings/portal-db'],
            message:
              'Do not import Internal types unless within an API. Instead use typings available from /typings',
          },
        ],
      },
    ],
    'tailwindcss/no-custom-classname': 'error',
    'tailwindcss/enforces-shorthand': 'warn',
    'tailwindcss/no-contradicting-classname': 'error',
    'tailwindcss/classnames-order': [
      'warn',
      {
        officialSorting: true,
        prependCustom: true,
      },
    ],
    '@tanstack/query/exhaustive-deps': 'warn',
    '@tanstack/query/prefer-query-object-syntax': 'warn',
    'no-console': 'error',
  },
};

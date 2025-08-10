const { defineConfig } = require('eslint/config');
const expo = require('eslint-config-expo/flat');

module.exports = defineConfig([
  ...expo,
  {
    ignores: ['node_modules', 'dist', '.next', 'public', '.expo', 'build', 'vitest.config.ts'],
    plugins: {
      'react-native': require('eslint-plugin-react-native'),
      'unused-imports': require('eslint-plugin-unused-imports'),
      'jsx-a11y': require('eslint-plugin-jsx-a11y'),
    },
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // 🔒 TS strict
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/no-floating-promises': 'error',

      // 🔧 JS clean
      'prefer-const': 'error',
      'no-empty-function': 'error',
      'object-shorthand': ['error', 'always'],
      'no-console': 'error',
      'no-debugger': 'error',
      'react/jsx-boolean-value': ['error', 'never'],
      'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
      'react/jsx-sort-props': [
        'warn',
        {
          callbacksLast: true,
          shorthandFirst: true,
          noSortAlphabetically: false,
          reservedFirst: true,
        },
      ],

      // ✂️ Imports
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
          pathGroups: [
            { pattern: 'react', group: 'external', position: 'before' },
            { pattern: '@/**', group: 'internal' },
          ],
          pathGroupsExcludedImportTypes: ['react'],
          alphabetize: { order: 'asc', caseInsensitive: true },
          'newlines-between': 'always',
        },
      ],

      // 🔁 Spacing & formatting
      'no-multiple-empty-lines': ['warn', { max: 1, maxEOF: 0 }],
      'no-trailing-spaces': 'warn',
      'eol-last': ['warn', 'always'],
      indent: ['warn', 2, { SwitchCase: 1 }],

      // 🧠 React Native best practices
      'react-native/no-inline-styles': 'warn',
      //'react-native/no-color-literals': 'warn',
      'react-native/split-platform-components': 'warn',

      // 🧠 Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // 🧠 A11y
      // 'jsx-a11y/accessible-emoji': 'warn',
      'jsx-a11y/label-has-associated-control': [
        'warn',
        {
          controlComponents: ['TextInput'],
          depth: 3,
        },
      ],
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',

      // 🔒 Security
      'require-await': 'error',
      'no-return-await': 'error',
    },
  },
]);

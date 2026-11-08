import baseConfig from './base.js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...baseConfig,
  {
    rules: {
      'react-native/no-inline-styles': 'off',
    },
  },
];

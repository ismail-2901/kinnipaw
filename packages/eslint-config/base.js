/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'no-unused-vars': 'off',
      'prefer-const': 'error',
    },
  },
];

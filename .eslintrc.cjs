module.exports = {
  extends: [
    '@antfu',
  ],
  ignorePatterns: ['coverage/*', 'esm', 'docs', 'dist'],
  rules: {
    'semi': 'off',
    '@typescript-eslint/semi': ['error', 'always'],
    'curly': ['error', 'multi-line'],
    'brace-style': 'off',
    '@typescript-eslint/brace-style': ['error', '1tbs'],
  },
};

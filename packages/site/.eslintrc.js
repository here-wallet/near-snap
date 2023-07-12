module.exports = {
  extends: ['../../.eslintrc.js'],

  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
      rules: {
        'jsdoc/require-jsdoc': 0,
        '@typescript-eslint/no-empty-function': 0,
      },
    },
  ],

  ignorePatterns: ['!.eslintrc.js', 'build/'],
};

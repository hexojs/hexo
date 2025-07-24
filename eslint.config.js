const config = require('eslint-config-hexo/ts');
const testConfig = require('eslint-config-hexo/test');

module.exports = [
  // Configurations applied globally
  ...config,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-var-requires': 0,
      '@typescript-eslint/no-require-imports': 0,
      'n/no-missing-require': 0,
      'n/no-missing-import': 0,
      '@typescript-eslint/no-unused-vars': [
        'error', {
          'argsIgnorePattern': '^_'
        }
      ]
    }
  },
  // Configurations applied only to test files
  {
    files: [
      'test/**/*.ts'
    ],
    languageOptions: {
      ...testConfig.languageOptions
    },
    rules: {
      ...testConfig.rules,
      '@typescript-eslint/ban-ts-comment': 0,
      '@typescript-eslint/no-unused-expressions': 0,
      '@typescript-eslint/no-unused-vars': [
        'error', {
          'varsIgnorePattern': '^_',
          'argsIgnorePattern': '^_',
          'caughtErrorsIgnorePattern': '^_'
        }
      ]
    }
  }
];

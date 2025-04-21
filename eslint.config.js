const config = require('eslint-config-hexo/ts');

module.exports = [
  ...config,
  {
    'rules': {
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
  }
];

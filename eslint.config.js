const config = require('eslint-config-hexo/ts');

module.exports = [
  ...config,
  {
    "rules": {
      "@typescript-eslint/no-explicit-any": 0,
      "@typescript-eslint/no-var-requires": 0,
      "node/no-missing-require": 0
    }
  }
];

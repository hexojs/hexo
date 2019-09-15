'use strict';

const { gravatar } = require('hexo-util');

module.exports = function(email, options) {
  return gravatar(email, options);
};

'use strict';

module.exports = function(path, options) {
  const url_for = require('hexo-util').url_for.bind(this);
  return url_for(path, options);
};

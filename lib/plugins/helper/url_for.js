'use strict';

const { url_for } = require('hexo-util');

module.exports = function(path, options) {
  return url_for.call(this, path, options);
};

'use strict';
const { full_url_for } = require('hexo-util');

module.exports = function(path) {
  return full_url_for.call(this, path);
};

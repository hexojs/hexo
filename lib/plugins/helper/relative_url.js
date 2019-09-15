'use strict';

module.exports = function(from, to) {
  const relative_url = require('hexo-util').relative_url.bind(this);
  return relative_url(from, to);
};

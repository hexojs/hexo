'use strict';

var url = require('url');
var _ = require('lodash');

function urlForHelper(path, options) {
  path = path || '/';

  if (path[0] === '#' || path.substring(0, 2) === '//') {
    return path;
  }

  var config = this.config;
  var root = config.root;
  var data = url.parse(path);

  options = _.assign({
    relative: config.relative_link
  }, options);

  // Exit if this is an external path
  if (data.protocol) {
    return path;
  }

  // Resolve relative url
  if (options.relative) {
    return this.relative_url(this.path, path);
  }

  // Prepend root path
  path = root + path;

  return path.replace(/\/{2,}/g, '/');
}

module.exports = urlForHelper;

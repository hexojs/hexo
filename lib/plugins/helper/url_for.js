'use strict';

const url = require('url');
const _ = require('lodash');

function urlForHelper(path = '/', options) {
  if (path[0] === '#' || path.substring(0, 2) === '//') {
    return path;
  }

  const config = this.config;
  const root = config.root;
  const data = url.parse(path);

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

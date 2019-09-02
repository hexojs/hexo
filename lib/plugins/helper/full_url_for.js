'use strict';

const { parse } = require('url');

function urlForHelper(path = '/') {
  if (path.startsWith('//')) {
    return path;
  }

  const { config } = this;
  const data = parse(path);

  // Exit if this is an external path
  if (data.protocol) {
    return path;
  }

  // Prepend root path
  path = config.url + `/${path}`.replace(/\/{2,}/g, '/');
  return path;
}

module.exports = urlForHelper;

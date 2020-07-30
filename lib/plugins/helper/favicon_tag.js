'use strict';

const { url_for } = require('hexo-util');

function faviconTagHelper(path) {
  return `<link rel="shortcut icon" href="${url_for.call(this, path)}">`;
}

module.exports = faviconTagHelper;

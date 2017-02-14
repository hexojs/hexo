'use strict';

function faviconTagHelper(path) {
  return '<link rel="shortcut icon" href="' + this.url_for(path) + '">';
}

module.exports = faviconTagHelper;

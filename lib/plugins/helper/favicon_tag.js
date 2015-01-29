'use strict';

function faviconTagHelper(path){
  /* jshint validthis: true */
  return '<link rel="shortcut icon" href="' + this.url_for(path) + '">';
}

module.exports = faviconTagHelper;
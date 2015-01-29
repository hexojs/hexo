'use strict';

var url = require('url');

function urlForHelper(path, options){
  /* jshint validthis: true */
  path = path || '/';
  options = options || {};

  var config = this.config;
  var root = config.root;
  var data = url.parse(path);

  if (!data.protocol && path.substring(0, 2) !== '//'){
    if (config.relative_link){
      path = this.relative_url(this.path, path);
    } else {
      if (path.substring(0, root.length) !== root){
        if (path.substring(0, 1) === '/'){
          path = root.substring(0, root.length - 1) + path;
        } else {
          path = root + path;
        }
      }
    }
  }

  return path;
}

module.exports = urlForHelper;
'use strict';

var url = require('url');
var _ = require('lodash');

function urlForHelper(path, options){
  /* jshint validthis: true */
  path = path || '/';

  var config = this.config;
  var root = config.root;
  var data = url.parse(path);

  options = _.assign({
    relative: config.relative_link
  }, options);

  // Exit if this is an external path
  if (data.protocol || path.substring(0, 2) === '//'){
    return path;
  }

  // Resolve relative url
  if (options.relative){
    return this.relative_url(this.path, path);
  }

  // Prepend root path
  if (path[0] !== '/'){
    return root + path;
  }

  return path;
}

module.exports = urlForHelper;
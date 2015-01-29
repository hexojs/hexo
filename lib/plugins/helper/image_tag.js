'use strict';

var htmlTag = require('hexo-util').htmlTag;

function imageTagHelper(path, options){
  /* jshint validthis: true */
  options = options || {};

  var attrs = {
    src: this.url_for(path)
  };

  var keys = Object.keys(options);
  var key = '';

  for (var i = 0, len = keys.length; i < len; i++){
    key = keys[i];
    attrs[key] = options[key];
  }

  if (attrs.class && Array.isArray(attrs.class)){
    attrs.class = attrs.class.join(' ');
  }

  return htmlTag('img', attrs);
}

module.exports = imageTagHelper;
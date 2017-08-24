'use strict';

var htmlTag = require('hexo-util').htmlTag;

function linkToHelper(path, text, options) {
  if (typeof options === 'boolean') options = {external: options};
  options = options || {};

  if (!text) text = path.replace(/^https?:\/\/|\/$/g, '');

  var attrs = {
    href: this.url_for(path),
    title: text
  };

  var keys = Object.keys(options);
  var key = '';

  for (var i = 0, len = keys.length; i < len; i++) {
    key = keys[i];
    attrs[key] = options[key];
  }

  if (attrs.external) {
    attrs.target = '_blank';
    attrs.rel = 'noopener';
    attrs.external = null;
  }

  if (attrs.class && Array.isArray(attrs.class)) {
    attrs.class = attrs.class.join(' ');
  }

  return htmlTag('a', attrs, text);
}

module.exports = linkToHelper;

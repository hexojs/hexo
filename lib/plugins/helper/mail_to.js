'use strict';

var htmlTag = require('hexo-util').htmlTag;
var qs = require('querystring');

function mailToHelper(path, text, options) {
  options = options || {};

  if (Array.isArray(path)) path = path.join(',');
  if (!text) text = path;

  var attrs = {
    href: 'mailto:' + path,
    title: text
  };

  var keys = Object.keys(options);
  var key = '';

  for (var i = 0, len = keys.length; i < len; i++) {
    key = keys[i];
    attrs[key] = options[key];
  }

  if (attrs.class && Array.isArray(attrs.class)) {
    attrs.class = attrs.class.join(' ');
  }

  var data = {};

  ['subject', 'cc', 'bcc', 'body'].forEach(function(i) {
    var item = attrs[i];

    if (item) {
      data[i] = Array.isArray(item) ? item.join(',') : item;
      attrs[i] = null;
    }
  });

  var querystring = qs.stringify(data);
  if (querystring) attrs.href += '?' + querystring;

  return htmlTag('a', attrs, text);
}

module.exports = mailToHelper;

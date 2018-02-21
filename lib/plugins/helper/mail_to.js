'use strict';

const htmlTag = require('hexo-util').htmlTag;
const qs = require('querystring');

function mailToHelper(path, text, options = {}) {
  if (Array.isArray(path)) path = path.join(',');
  if (!text) text = path;

  const attrs = {
    href: `mailto:${path}`,
    title: text
  };

  const keys = Object.keys(options);
  let key = '';

  for (let i = 0, len = keys.length; i < len; i++) {
    key = keys[i];
    attrs[key] = options[key];
  }

  if (attrs.class && Array.isArray(attrs.class)) {
    attrs.class = attrs.class.join(' ');
  }

  const data = {};

  ['subject', 'cc', 'bcc', 'body'].forEach(i => {
    const item = attrs[i];

    if (item) {
      data[i] = Array.isArray(item) ? item.join(',') : item;
      attrs[i] = null;
    }
  });

  const querystring = qs.stringify(data);
  if (querystring) attrs.href += `?${querystring}`;

  return htmlTag('a', attrs, text);
}

module.exports = mailToHelper;

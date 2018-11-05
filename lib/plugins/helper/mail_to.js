'use strict';

const { htmlTag } = require('hexo-util');
const qs = require('querystring');

function mailToHelper(path, text, options = {}) {
  if (Array.isArray(path)) path = path.join(',');
  if (!text) text = path;

  const attrs = Object.assign({
    href: `mailto:${path}`,
    title: text
  }, options);

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

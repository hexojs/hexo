'use strict';

const { htmlTag, url_for } = require('hexo-util');

function linkToHelper(path, text, options = {}) {
  if (typeof options === 'boolean') options = {external: options};

  if (!text) text = path.replace(/^https?:\/\/|\/$/g, '');

  const attrs = Object.assign({
    href: url_for.call(this, path),
    title: text
  }, options);

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

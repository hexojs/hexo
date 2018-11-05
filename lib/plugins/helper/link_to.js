'use strict';

const { htmlTag } = require('hexo-util');

function linkToHelper(path, text, options = {}) {
  if (typeof options === 'boolean') options = {external: options};

  if (!text) text = path.replace(/^https?:\/\/|\/$/g, '');

  const attrs = Object.assign({
    href: this.url_for(path),
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

'use strict';

const { htmlTag } = require('hexo-util');

function imageTagHelper(path, options = {}) {
  const attrs = Object.assign({
    src: this.url_for(path)
  }, options);

  if (attrs.class && Array.isArray(attrs.class)) {
    attrs.class = attrs.class.join(' ');
  }

  return htmlTag('img', attrs);
}

module.exports = imageTagHelper;

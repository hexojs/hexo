'use strict';

const { htmlTag, url_for } = require('hexo-util');
const { default: moize } = require('moize');

function jsHelper(...args) {
  let result = '\n';

  args.flat(Infinity).forEach(item => {
    if (typeof item === 'string' || item instanceof String) {
      let path = item;
      if (!path.endsWith('.js')) {
        path += '.js';
      }
      result += `<script src="${url_for.call(this, path)}"></script>\n`;
    } else {
      // Custom attributes
      item.src = url_for.call(this, item.src);
      if (!item.src.endsWith('.js')) item.src += '.js';
      result += htmlTag('script', { ...item }, '') + '\n';
    }
  });
  return result;
}

module.exports = moize(jsHelper, {
  maxSize: 10,
  isDeepEqual: true
});

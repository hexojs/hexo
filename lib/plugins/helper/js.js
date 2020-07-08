'use strict';

const { htmlTag } = require('hexo-util');

function jsHelper(...args) {
  let result = '\n';

  args.flat().forEach(item => {
    // Old syntax
    if (typeof item === 'string' || item instanceof String) {
      let path = item;
      if (!path.endsWith('.js')) {
        path += '.js';
      }
      result += `<script src="${this.url_for(path)}"></script>\n`;
    } else {
      // New syntax
      item.src = this.url_for(item.src);
      if (!item.src.endsWith('.js')) item.src += '.js';
      result += htmlTag('script', { ...item }, '') + '\n';
    }
  });
  return result;
}

module.exports = jsHelper;

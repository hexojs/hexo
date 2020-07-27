'use strict';

const { htmlTag, url_for } = require('hexo-util');

/* flatten() to be replaced by Array.flat()
after Node 10 has reached EOL */
const flatten = function(arr, result = []) {
  for (const i in arr) {
    const value = arr[i];
    if (Array.isArray(value)) {
      flatten(value, result);
    } else {
      result.push(value);
    }
  }
  return result;
};

function jsHelper(...args) {
  let result = '\n';

  flatten(args).forEach(item => {
    // Old syntax
    if (typeof item === 'string' || item instanceof String) {
      let path = item;
      if (!path.endsWith('.js')) {
        path += '.js';
      }
      result += `<script src="${url_for.call(this, path)}"></script>\n`;
    } else {
      // New syntax
      item.src = url_for.call(this, item.src);
      if (!item.src.endsWith('.js')) item.src += '.js';
      result += htmlTag('script', { ...item }, '') + '\n';
    }
  });
  return result;
}

module.exports = jsHelper;

'use strict';

const { htmlTag } = require('hexo-util');

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

function cssHelper(...args) {
  let result = '\n';

  flatten(args).forEach(item => {
    // Old syntax
    if (typeof item === 'string' || item instanceof String) {
      let path = item;
      if (!path.endsWith('.css')) {
        path += '.css';
      }
      result += `<link rel="stylesheet" href="${this.url_for(path)}">\n`;
    } else {
      // New syntax
      item.href = this.url_for(item.href);
      if (!item.href.endsWith('.css')) item.href += '.css';
      result += htmlTag('link', { rel: 'stylesheet', ...item }) + '\n';
    }
  });
  return result;
}

module.exports = cssHelper;

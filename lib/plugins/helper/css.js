'use strict';

const { htmlTag } = require('hexo-util');
const url_for = require('./url_for');

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
  let items = args;

  if (!Array.isArray(args)) {
    items = [args];
  }

  items = flatten(items);

  items.forEach(item => {
    // Old syntax
    if (typeof item === 'string' || item instanceof String) {
      let path = item;
      if (!path.endsWith('.css')) {
        path += '.css';
      }
      result += `<link rel="stylesheet" href="${this.url_for(path)}">\n`;
    } else {
      // New syntax
      item.href = url_for.call(this, item.href);
      if (!item.href.endsWith('.css')) item.href += '.css';
      result += htmlTag('link', { rel: 'stylesheet', ...item }) + '\n';
    }
  });
  return result;
}

module.exports = cssHelper;

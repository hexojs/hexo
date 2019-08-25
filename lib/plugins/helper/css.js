'use strict';

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
      let tmpResult = '<link rel="stylesheet"';
      for (const attribute in item) {
        if (attribute === 'href') {
          item[attribute] = this.url_for(item[attribute]);
          if (!item[attribute].endsWith('.css')) item[attribute] += '.css';
        }
        tmpResult += ` ${attribute}="${item[attribute]}"`;
      }
      tmpResult += '>\n';
      result += tmpResult;
    }
  });
  return result;
}

module.exports = cssHelper;

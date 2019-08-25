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

function jsHelper(...args) {
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
      if (!path.endsWith('.js')) {
        path += '.js';
      }
      result += `<script src="${this.url_for(path)}"></script>\n`;
    } else {
      // New syntax
      let tmpResult = '<script';
      for (const attribute in item) {
        if (attribute === 'src') {
          item[attribute] = this.url_for(item[attribute]);
          if (!item[attribute].endsWith('.js')) item[attribute] += '.js';
        }

        if (item[attribute] === true) tmpResult += ' ' + attribute;
        else tmpResult += ` ${attribute}="${item[attribute]}"`;
      }
      tmpResult += '></script>\n';
      result += tmpResult;
    }
  });
  return result;
}

module.exports = jsHelper;

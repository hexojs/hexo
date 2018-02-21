'use strict';

function cssHelper(...args) {
  let result = '';
  let path = '';

  for (let i = 0, len = args.length; i < len; i++) {
    path = args[i];

    if (i) result += '\n';

    if (Array.isArray(path)) {
      result += cssHelper.apply(this, path);
    } else {
      if (path.indexOf('?') < 0 && path.substring(path.length - 4, path.length) !== '.css') path += '.css';
      result += `<link rel="stylesheet" href="${this.url_for(path)}">`;
    }
  }

  return result;
}

module.exports = cssHelper;

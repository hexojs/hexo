'use strict';

function cssHelper(...args) {
  let result = '';

  for (let i = 0, len = args.length; i < len; i++) {
    let path = args[i];

    if (i) result += '\n';

    if (Array.isArray(path)) {
      result += Reflect.apply(cssHelper, this, path);
    } else {
      if (!path.includes('?') && !path.endsWith('.css')) path += '.css';
      result += `<link rel="stylesheet" href="${this.url_for(path)}">`;
    }
  }

  return result;
}

module.exports = cssHelper;

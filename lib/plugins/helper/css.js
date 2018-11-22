'use strict';

function cssHelper(...args) {
  return args.reduce((result, path, i) => {
    if (i) result += '\n';

    if (Array.isArray(path)) {
      return result + Reflect.apply(cssHelper, this, path);
    }
    if (!path.includes('?') && !path.endsWith('.css')) path += '.css';
    return `${result}<link rel="stylesheet" href="${this.url_for(path)}">`;
  }, '');
}

module.exports = cssHelper;

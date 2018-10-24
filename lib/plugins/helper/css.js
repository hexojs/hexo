'use strict';

function cssHelper(...args) {
  return args.reduce((_result, path, i) => {
    if (i) _result += '\n';

    if (Array.isArray(path)) {
      _result += cssHelper.apply(this, path);
    } else {
      if (!path.includes('?') && !path.endsWith('.css')) path += '.css';
      _result += `<link rel="stylesheet" href="${this.url_for(path)}">`;
    }
    return _result;
  }, '');
}

module.exports = cssHelper;

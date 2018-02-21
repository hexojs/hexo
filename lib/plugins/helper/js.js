'use strict';

function jsHelper(...args) {
  let result = '';
  let path = '';

  for (let i = 0, len = args.length; i < len; i++) {
    path = args[i];

    if (i) result += '\n';

    if (Array.isArray(path)) {
      result += jsHelper.apply(this, path);
    } else {
      if (path.indexOf('?') < 0 && path.substring(path.length - 3, path.length) !== '.js') path += '.js';
      result += `<script src="${this.url_for(path)}"></script>`;
    }
  }

  return result;
}

module.exports = jsHelper;

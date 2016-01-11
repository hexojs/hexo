'use strict';

function cssHelper() {
  var result = '';
  var path = '';

  for (var i = 0, len = arguments.length; i < len; i++) {
    path = arguments[i];

    if (i) result += '\n';

    if (Array.isArray(path)) {
      result += cssHelper.apply(this, path);
    } else {
      if (path.substring(path.length - 4, path.length) !== '.css') path += '.css';
      result += '<link rel="stylesheet" href="' + this.url_for(path) + '">';
    }
  }

  return result;
}

module.exports = cssHelper;

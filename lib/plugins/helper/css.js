var pathFn = require('path');

function cssHelper(){
  var result = '';
  var path = '';

  for (var i = 0, len = arguments.length; i < len; i++){
    path = arguments[i];

    if (Array.isArray(path)){
      result += cssHelper.apply(this, path);
    } else {
      if (pathFn.extname(path) !== '.css') path += '.css';
      result += '<link rel="stylesheet" href="' + this.url_for(path) + '" type="text/css">\n';
    }
  }

  return result;
}

module.exports = cssHelper;
'use strict';

function jsHelper(){
  /* jshint validthis: true */
  var result = '';
  var path = '';

  for (var i = 0, len = arguments.length; i < len; i++){
    path = arguments[i];

    if (i) result += '\n';

    if (Array.isArray(path)){
      result += jsHelper.apply(this, path);
    } else {
      if (path.substring(path.length - 3, path.length) !== '.js') path += '.js';
      result += '<script src="' + this.url_for(path) + '" type="text/javascript"></script>';
    }
  }

  return result;
}

module.exports = jsHelper;
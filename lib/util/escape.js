/**
* @class escape
* @namespace Hexo.util
* @module hexo
* @static
*/

/**
* Converts the string to a proper filename.
*
* Transform:
*   - 1: Lower case
*   - 2: Upper case
*
* @method filename
* @param {String} str
* @param {Number} [transform]
* @return {String}
* @static
*/

exports.filename = function(str, transform){
  var result = str.toString().toLowerCase()
    .replace(/\s/g, '-')
    .replace(/\/|\\|\?|%|\*|:|\||'|"|<|>|\.|#/g, '');

  if (transform == 1){
    result = result.toLowerCase();
  } else if (transform == 2){
    result = result.toUpperCase();
  }

  return result;
};

/**
* Converts the string to a proper path.
*
* Transform:
*   - 1: Lower case
*   - 2: Upper case
*
* @method path
* @param {String} str
* @param {Number} transform
* @return {String}
* @static
*/

exports.path = function(str, transform){
  var result = str.toString()
    .replace(/\s/g, '-')
    .replace(/:|\/|\?|#|\[|\]|@|!|\$|&|'|\(|\)|\*|\+|,|;|=|\\|%|<|>|\./g, '');

  if (transform == 1){
    result = result.toLowerCase();
  } else if (transform == 2){
    result = result.toUpperCase();
  }

  return result;
};

/**
* Converts all tabs to spaces in the string.
*
* @method yaml
* @param {String} str
* @return {String}
* @static
*/

exports.yaml = function(str){
  return str.replace(/\n(\t+)/g, function(match, tabs){
    var result = '\n';

    for (var i=0, len=tabs.length; i<len; i++){
      result += '  ';
    }

    return result;
  });
};
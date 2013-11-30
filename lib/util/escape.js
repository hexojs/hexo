/**
 * Escapes the given `str` to a valid filename.
 *
 * @param {String} str
 * @param {Number} transform
 * @return {String}
 * @api public
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
 * Escapes the given `str` to a valid URL.
 *
 * @param {String} str
 * @param {Number} transform
 * @return {String}
 * @api public
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
 * Escapes the given `str` to a valid YAML.
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
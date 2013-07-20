/**
 * Escape the given `str` to a valid filename.
 *
 * @param {String} str
 * @param {Number} transform
 * @return {String}
 * @api public
 */

exports.filename = function(str, transform){
  var result = str.toString().toLowerCase()
    .replace(/\s/g, '-')
    .replace(/\/|\\|\?|%|\*|:|\||"|<|>|\.|#/g, '');

  if (transform == 1){
    result = result.toLowerCase();
  } else if (transform == 2){
    result = result.toUpperCase();
  }

  return result;
};

/**
 * Escape the given `str` to a valid URL.
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
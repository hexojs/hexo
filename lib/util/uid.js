var str = '0123456789abcdefghijklmnopqrstuvwxyz',
  strUpper = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

var total = str.length,
  totalUpper = strUpper.length;

/**
 * Generates a random string.
 *
 * @param {Number} length
 * @param {Boolean} uppercase
 * @return {String}
 * @api public
 */

module.exports = function(length, uppercase){
  var result = '';

  for (var i = 0; i < length; i++){
    if (uppercase){
      result += strUpper[parseInt(Math.random() * totalUpper)];
    } else {
      result += str[parseInt(Math.random() * total)];
    }
  }

  return result;
};
/**
 * The words that don't need to be captialized.
 */

var words = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'en', 'for', 'if', 'in', 'of', 'on', 'or', 'the', 'to', 'v', 'v.', 'via', 'vs', 'vs.'];

/**
 * Captialize the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

var capitalize = function(str){
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Captialize the given `content`.
 *
 * @param {String} content
 * @return {String}
 * @api public
 */

module.exports = function(content){
  var arr = content.toString().split(' '),
    result = [];

  arr.forEach(function(item){
    item = item.toLowerCase();

    if (words.indexOf(item) === -1){
      result.push(capitalize(item));
    } else {
      result.push(item);
    }
  });

  return result.join(' ');
};
/**
 * Wraps content with HTML tag.
 *
 * @param {String} tag
 * @param {Object} attrs
 * @param {String} [text]
 * @return {String}
 * @api public
 */

module.exports = function(tag, attrs, text){
  var result = '<' + tag;

  for (var i in attrs){
    if (attrs[i]) result += ' ' + i + '="' + attrs[i] + '"';
  }

  result += text ? '>' + text + '</' + tag + '>' : '>';

  return result;
};
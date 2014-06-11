/**
* String format utilities.
*
* @class format
* @namespace util
* @since 2.4.0
* @module hexo
*/

var _ = require('lodash');

/**
* Removes all HTML tags.
*
* @method stripHtml
* @param {String} content
* @return {String}
* @static
*/

exports.strip_html = exports.stripHtml = function(content){
  return content.toString().replace(/<[^>]*>/g, '');
};

/**
* Removes whitespace from both ends of the string.
*
* @method trim
* @param {String} content
* @return {String}
* @static
*/

exports.trim = function(content){
  return content.toString().trim();
};

/**
* See {% crosslink util.inflector/titleize %}.
*
* @method titlecase
* @param {String} str
* @return {String}
* @static
*/

exports.titlecase = require('./inflector').titlecase;

/**
* Wraps the `text` into lines no longer than `width`.
*
* @method word_wrap
* @param {String} text
* @param {Number} width
* @return {String}
* @static
*/

exports.word_wrap = exports.wordWrap = function(text, width){
  width = width || 80;

  var arr = [];

  for (var i = 0, length = text.length; i < length; i += width){
    arr.push(text.substr(i, width));
  }

  return arr.join('\n');
};

/**
* Truncates the given `text`.
*
* @method truncate
* @param {String} text
* @param {Object} [options]
*   @param {Number} [options.length=30]
*   @param {String} [options.omission=...]
*   @param {String} [options.separator]
* @return {String}
* @static
*/

exports.truncate = function(text, options){
  options = _.extend({
    length: 30,
    omission: '...',
    seperator: ''
  }, options);

  var length = options.length,
    omission = options.omission,
    separator = options.separator;

  if (text.length <= length) return text;

  var result = '';

  if (separator){
    var split = text.split(separator);

    for (var i = 0, len = split.length; i < len; i++){
      var item = split[i];

      if ((result + item + omission).length - 1 <= length){
        result += item + ' ';
      } else {
        break;
      }
    }

    result = result.substring(0, result.length - 1) + omission;
  } else {
    result = text.substring(0, length - omission.length) + omission;
  }


  return result;
};
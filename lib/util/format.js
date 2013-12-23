var _ = require('lodash');

exports.strip_html = function(content){
  return content.toString().replace(/<[^>]*>/g, '');
};

exports.trim = function(content){
  return content.toString().trim();
};

exports.titlecase = require('./inflector').titlecase;

exports.word_wrap = function(text, width){
  width = width || 80;

  var arr = [];

  for (var i = 0, length = text.length; i < length; i += width){
    arr.push(text.substr(i, width));
  }

  return arr.join('\n');
};

exports.truncate = function(text, options){
  var options = _.extend({
    length: 30,
    omission: '...',
    seperator: ''
  }, options);

  var length = options.length,
    omission = options.omission,
    separator = options.separator;

  if (text.length <= length) return text;

  if (separator){
    var split = text.split(separator),
      result = '';

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
    var result = text.substring(0, length - omission.length) + omission;
  }


  return result;
};
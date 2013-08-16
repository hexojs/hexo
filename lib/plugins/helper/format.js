var util = require('../../util');

var renderFn = hexo.render,
  renderSync = renderFn.renderSync;

exports.strip_html = function(content){
  return content.toString().replace(/<[^>]*>/g, '');
};

exports.trim = function(content){
  return content.toString().trim();
};

exports.titlecase = util.titlecase;

exports.markdown = function(){
  return renderSync({text: text, engine: 'markdown'});
};

exports.word_wrap = function(text, width){
  width = width || 80;

  var arr = [];

  for (var i = 0, length = text.length; i < length; i += width){
    arr.push(text.substr(i, width));
  }

  return arr.join('\n');
};

exports.truncate = function(text, length){
  return text.substring(0, length);
};

exports.truncate_words = function(text, length){
  return text.split(' ').slice(0, length).join(' ');
};
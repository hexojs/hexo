var _ = require('lodash'),
  util = require('../../util'),
  format = util.format;

exports.strip_html = format.strip_html;

exports.trim = format.trim;

exports.titlecase = util.titlecase;

exports.markdown = function(text){
  return hexo.render.renderSync({text: text, engine: 'markdown'});
};

exports.word_wrap = format.word_wrap;

exports.truncate = format.truncate;

exports.render = function(str, engine, locals){
  return hexo.render.renderSync(str, engine, locals);
};
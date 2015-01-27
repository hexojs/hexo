'use strict';

var util = require('hexo-util');
var titlecase = require('titlecase');

exports.strip_html = util.stripHTML;

exports.trim = function(str){
  return str.trim();
};

exports.titlecase = titlecase;

exports.word_wrap = util.wordWrap;

exports.truncate = util.truncate;
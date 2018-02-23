'use strict';

const util = require('hexo-util');
const titlecase = require('titlecase');

exports.strip_html = exports.stripHTML = util.stripHTML;

exports.trim = str => str.trim();

exports.titlecase = titlecase;

exports.word_wrap = exports.wordWrap = util.wordWrap;

exports.truncate = util.truncate;

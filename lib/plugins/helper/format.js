'use strict';

const { stripHTML, wordWrap, truncate } = require('hexo-util');
const titlecase = require('titlecase');

exports.strip_html = stripHTML;
exports.stripHTML = stripHTML;

exports.trim = str => str.trim();

exports.titlecase = titlecase;

exports.word_wrap = wordWrap;
exports.wordWrap = wordWrap;

exports.truncate = truncate;

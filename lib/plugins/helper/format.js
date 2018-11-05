'use strict';

const { stripHTML, wordWrap, truncate } = require('hexo-util');
const titlecase = require('titlecase');

exports.strip_html = exports.stripHTML = stripHTML;

exports.trim = str => str.trim();

exports.titlecase = titlecase;

exports.word_wrap = exports.wordWrap = wordWrap;

exports.truncate = truncate;

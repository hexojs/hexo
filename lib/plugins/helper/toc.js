'use strict';

var cheerio;
const _ = require('lodash');

function tocHelper(str, options) {
  options = options || {};

  if (!cheerio) cheerio = require('cheerio');

  var $ = cheerio.load(str);
  var headingsMaxDepth = options.hasOwnProperty('max_depth') ? options.max_depth : 6;
  var headingsSelector = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].slice(0, headingsMaxDepth).join(',');
  var headings = $(headingsSelector);

  if (!headings.length) return '';

  var className = options.class || 'toc';
  var listNumber = options.hasOwnProperty('list_number') ? options.list_number : true;
  var result = '<ol class="' + className + '">';
  var lastNumber = [0, 0, 0, 0, 0, 0];
  var firstLevel = 0;
  var lastLevel = 0;
  var i = 0;

  headings.each(function() {
    var level = +this.name[1];
    var id = $(this).attr('id');
    var text = _.escape($(this).text());

    lastNumber[level - 1]++;

    for (i = level; i <= 5; i++) {
      lastNumber[i] = 0;
    }

    if (firstLevel) {
      for (i = level; i < lastLevel; i++) {
        result += '</li></ol>';
      }

      if (level > lastLevel) {
        result += '<ol class="' + className + '-child">';
      } else {
        result += '</li>';
      }
    } else {
      firstLevel = level;
    }

    result += '<li class="' + className + '-item ' + className + '-level-' + level + '">';
    result += '<a class="' + className + '-link" href="#' + id + '">';

    if (listNumber) {
      result += '<span class="' + className + '-number">';

      for (i = firstLevel - 1; i < level; i++) {
        result += lastNumber[i] + '.';
      }

      result += '</span> ';
    }

    result += '<span class="' + className + '-text">' + text + '</span></a>';

    lastLevel = level;
  });

  for (i = firstLevel - 1; i < lastLevel; i++) {
    result += '</li></ol>';
  }

  return result;
}

module.exports = tocHelper;

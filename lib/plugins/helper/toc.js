'use strict';

let cheerio;
const escape = require('lodash/escape');

function tocHelper(str, options = {}) {
  if (!cheerio) cheerio = require('cheerio');

  const $ = cheerio.load(str);
  const headingsMaxDepth = Object.prototype.hasOwnProperty.call(options, 'max_depth') ? options.max_depth : 6;
  const headingsSelector = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].slice(0, headingsMaxDepth).join(',');
  const headings = $(headingsSelector);

  if (!headings.length) return '';

  const className = options.class || 'toc';
  const listNumber = Object.prototype.hasOwnProperty.call(options, 'list_number') ? options.list_number : true;
  let result = `<ol class="${className}">`;
  const lastNumber = [0, 0, 0, 0, 0, 0];
  let firstLevel = 0;
  let lastLevel = 0;

  function getId(ele) {
    const id = $(ele).attr('id');
    const $parent = $(ele).parent();
    return id ||
    ($parent.length < 1 ? null :
      getId($parent));
  }

  headings.each(function() {
    const level = +this.name[1];
    const id = getId(this);
    const text = escape($(this).text());

    lastNumber[level - 1]++;

    for (let i = level; i <= 5; i++) {
      lastNumber[i] = 0;
    }

    if (firstLevel) {
      for (let i = level; i < lastLevel; i++) {
        result += '</li></ol>';
      }

      if (level > lastLevel) {
        result += `<ol class="${className}-child">`;
      } else {
        result += '</li>';
      }
    } else {
      firstLevel = level;
    }

    result += `<li class="${className}-item ${className}-level-${level}">`;
    result += `<a class="${className}-link" href="#${id}">`;

    if (listNumber) {
      result += `<span class="${className}-number">`;

      for (let i = firstLevel - 1; i < level; i++) {
        result += `${lastNumber[i]}.`;
      }

      result += '</span> ';
    }

    result += `<span class="${className}-text">${text}</span></a>`;

    lastLevel = level;
  });

  for (let i = firstLevel - 1; i < lastLevel; i++) {
    result += '</li></ol>';
  }

  return result;
}

module.exports = tocHelper;

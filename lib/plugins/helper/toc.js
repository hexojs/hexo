'use strict';

const { htmlTag, tocObj } = require('hexo-util');

function tocHelper(str, options = {}) {
  options = Object.assign({
    min_depth: 1,
    max_depth: 6,
    class: 'toc',
    list_number: true
  }, options);

  const data = tocObj(str, { min_depth: options.min_depth, max_depth: options.max_depth });

  if (!data.length) return '';

  const className = options.class;
  const listNumber = options.list_number;

  let result = htmlTag('ol', { class: className });
  const lastNumber = [0, 0, 0, 0, 0, 0];
  let firstLevel = 0;
  let lastLevel = 0;

  for (let i = 0, len = data.length; i < len; i++) {
    const el = data[i];
    const { level, id, text } = el;
    const href = id ? `#${id}` : id;

    lastNumber[level - 1]++;

    for (let i = level; i <= 5; i++) {
      lastNumber[i] = 0;
    }

    if (firstLevel) {
      for (let i = level; i < lastLevel; i++) {
        result += '</li></ol>';
      }

      if (level > lastLevel) {
        result += htmlTag('ol', { class: `${className}-child` });
      } else {
        result += '</li>';
      }
    } else {
      firstLevel = level;
    }

    result += htmlTag('li', { class: `${className}-item ${className}-level-${level}` });
    result += htmlTag('a', { class: `${className}-link`, href });

    if (listNumber) {
      result += htmlTag('span', { class: `${className}-number` });

      for (let i = firstLevel - 1; i < level; i++) {
        result += `${lastNumber[i]}.`;
      }

      result += '</span> ';
    }

    result += htmlTag('span', { class: `${className}-text` }, text) + '</a>';

    lastLevel = level;
  }

  for (let i = firstLevel - 1; i < lastLevel; i++) {
    result += '</li></ol>';
  }

  return result;
}

module.exports = tocHelper;

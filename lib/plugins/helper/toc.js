var _ = require('lodash'),
  util = require('../../util');

var rHeadingAll = /<h(\d)(.*?)>(.+?)<\/h\d>/g,
  rHeading = /<h(\d).*id="(.+?)".*>(.+?)<\/h\d>/;

module.exports = function(str, options){
  options = _.extend({
    class: 'toc',
    list_number: true
  }, options);

  var headings = str.match(rHeadingAll),
    data = [],
    result = '<ul class="' + options.class + '">',
    lastNumber = {},
    firstLevel = 0,
    lastLevel = 0,
    i;

  if (!headings || !headings.length) return '';

  for (i = 1; i <= 6; i++){
    lastNumber[i] = 0;
  }
  headings.forEach(function(heading, i){
    if (!rHeading.test(heading)) return;

    var match = heading.match(rHeading);

    data.push({
      level: +match[1],
      id: match[2],
      text: match[3]
    });
  });

  data.forEach(function(item){
    var level = item.level,
      number = '';

    if (!firstLevel){
      firstLevel = level;
      lastLevel = level;
    }

    lastNumber[level]++;

    for (i = level + 1; i <= 6; i++){
      lastNumber[i] = 0;
    }

    for (i = level; i < lastLevel; i++){
      result += '</ul>';
    }

    if (level > lastLevel) result += '<ul class="' + options.class + '-child">';

    if (options.list_number){
      number += '<span class="' + options.class + '-number">';

      for (i = firstLevel; i <= level; i++){
        number += lastNumber[i] + '.';
      }

      number += '</span> ';
    }

    result += '<li class="' + options.class + '-item ' + options.class + '-level-' + level + '">' +
      '<a class="' + options.class + '-link" href="#' + item.id + '">' +
        number + '<span class="' + options.class + '-text">' + item.text + '</span>' +
      '</a>' +
      '</li>';

    lastLevel = level;
  });

  result += '</ul>';

  return result;
};

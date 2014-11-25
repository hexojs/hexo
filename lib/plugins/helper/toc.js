var _ = require('lodash');
var cheerio = require('cheerio');

module.exports = function(str, options){
  options = _.extend({
    class: 'toc',
    list_number: true
  }, options);

  var $ = cheerio.load(str),
    headings = $('h1, h2, h3, h4, h5, h6');

  if (!headings.length) return '';

  var className = options.class;
  var listNumber = options.list_number;
  var result = '<ol class="' + options.class + '">';
  var lastNumber = [0, 0, 0, 0, 0, 0];
  var firstLevel = 0;
  var lastLevel = 0;
  var i = 0;

  headings.each(function(){
    var level = +this.name[1],
      id = $(this).attr('id'),
      text = $(this).text();

    lastNumber[level - 1]++;

    for (i = level; i <= 5; i++){
      lastNumber[i] = 0;
    }

    if (firstLevel){
      for (i = level; i < lastLevel; i++){
        result += '</li></ol>';
      }

      if (level > lastLevel){
        result += '<ol class="' + className + '-child">';
      } else {
        result += '</li>';
      }
    } else {
      firstLevel = level;
    }

    result += '<li class="' + className + '-item ' + className + '-level-' + level + '">';
    result += '<a class="' + className + '-link" href="#' + id + '">';

    if (listNumber){
      result += '<span class="' + className + '-number">';

      for (i = firstLevel - 1; i < level; i++){
        result += lastNumber[i] + '.';
      }

      result += '</span> ';
    }

    result += '<span class="' + className + '-text">' + text + '</span></a>';

    lastLevel = level;
  });

  for (i = firstLevel - 1; i < lastLevel; i++){
    result += '</li></ol>';
  }

  return result;
};

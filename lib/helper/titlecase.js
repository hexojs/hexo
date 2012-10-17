var extend = require('../extend'),
  _ = require('underscore'),
  words = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'en', 'for', 'if', 'in', 'of', 'on', 'or', 'the', 'to', 'v', 'v.', 'via', 'vs', 'vs.'];

var capitalize = function(str){
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

extend.helper.register('titlecase', function(content){
  var result = _.map(content.toString().split(' '), function(item){
    if (_.indexOf(words, item) === -1) return capitalize(item);
    else return item;
  }).join(' ');

  return result;
});
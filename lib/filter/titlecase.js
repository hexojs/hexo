var extend = require('../extend'),
  util = require('../util'),
  titlecase = util.titlecase;

extend.filter.register('titlecase', function(str){
  return titlecase(str);
});
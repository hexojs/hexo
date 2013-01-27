var extend = require('../../extend'),
  util = require('../../util'),
  titlecase = util.titlecase;

extend.helper.register('titlecase', function(){
  return titlecase;
});
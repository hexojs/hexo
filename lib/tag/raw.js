var extend = require('../extend');

extend.tag.register('raw', function(args, content){
  return content;
}, true);
var extend = require('../extend');

extend.helper.register('trim', function(content){
  return content.toString().trim();
});
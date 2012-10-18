var extend = require('../extend');

extend.helper.register('trim', function(){
  return function(content){
    return content.toString().trim();
  }
});
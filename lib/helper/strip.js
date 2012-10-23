var extend = require('../extend');

extend.helper.register('strip', function(){
  return function(content){
    return content.replace(/<[^>]*>/g, '');
  }
});
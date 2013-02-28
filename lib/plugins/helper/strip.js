var extend = require('../../extend');

extend.helper.register('strip_html', function(){
  return function(content){
    return content.replace(/<[^>]*>/g, '');
  }
});
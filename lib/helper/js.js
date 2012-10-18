var extend = require('../extend');

extend.helper.register('js', function(){
  return function(path){
    return '<script type="text/javascript" src="' + path + '">';
  }
});
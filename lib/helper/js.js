var extend = require('../extend');

extend.helper.register('js', function(path){
  return '<script type="text/javascript" src="' + path + '">';
});
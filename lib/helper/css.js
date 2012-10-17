var extend = require('../extend');

extend.helper.register('css', function(path){
  return '<link rel="stylesheet" href="' + path + '" type="text/css">';
});
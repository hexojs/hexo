var extend = require('../extend');

extend.render.register('gist', function(id, name){
  return '<script src="https://gist.github.com/'+id+'.js'+(name ? '?file=' + name : '')+'"></script>';
});
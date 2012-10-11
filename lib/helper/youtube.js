var extend = require('../extend');

extend.helper.register('youtube', function(args, content){
  var id = args[0];

  return '<iframe width="560" height="315" src="http://www.youtube.com/embed/' + id + '" frameborder="0" allowfullscreen></iframe>';
});
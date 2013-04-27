var extend = require('../../extend');

extend.tag.register('iframe', function(args, content){
  var url = args[0],
    width = args[1] && args[1] != 'default' ? args[1] : '100%',
    height = args[2] && args[2] != 'default' ? args[2] : '300px';
  return '<iframe height="350" marginheight="0" src="'+url+'" frameborder="0" width="'+width+'" height="'+height+'" marginwidth="0" scrolling="no"></iframe>';
});
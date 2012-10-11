var extend = require('../extend');

extend.helper.register('vimeo', function(args, content){
  var id = args[0];

  return '<iframe src="http://player.vimeo.com/video/' + id + '" width="560" height="315" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>';
});
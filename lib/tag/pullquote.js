var extend = require('../extend');

extend.tag.register('pullquote', function(args, content){
  var className = args.length ? ' ' + args.join(' ') : '';

  return '<blockquote class="pullquote' + className + '">' + content + '</blockquote>';
}, true);
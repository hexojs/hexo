var extend = require('../../extend'),
  renderSync = require('../../render').renderSync;

extend.tag.register('pullquote', function(args, content){
  var className = args.length ? ' ' + args.join(' ') : '';

  return '<blockquote class="pullquote' + className + '">' + renderSync({text: content, engine: 'markdown'}) + '</blockquote>';
}, true);
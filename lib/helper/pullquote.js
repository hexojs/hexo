var extend = require('../extend');

extend.helper.register('pullquote', function(args, content){
  var className = args[0] ? args[0] : 'alignright';

  return '<div class="pullquote '+className+'">'+content+'</div>';
}, true);
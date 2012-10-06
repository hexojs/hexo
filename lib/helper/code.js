var extend = require('../extend'),
  highlight = require('../highlight');

extend.helper.register('code', function(args, content){
  if (args.length){
    var title = args.shift();

    if (args.length){
      var link = '<a href="' + args[0] + '">' + (args[1] ? args[1] : args[0]) + '</a>';
    }

    var caption = '<span>' + title + '</span>' + (link ? link : '');

    return highlight(content, caption);
  }
}, true);
var extend = require('../extend'),
  highlight = require('../util').highlight;

extend.helper.register('code', function(args, content){
  var lang = args[0],
    title = args[1],
    url = args[2],
    link = args[3],
    caption = '';

  if (title) caption += '<span>' + title + '</span>';
  if (url) caption += '<a href="' + url + '">' + (link ? link : url) + '</a>';

  return highlight(content, lang, caption);
}, true);
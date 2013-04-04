var extend = require('../../extend'),
  util = require('../../util'),
  renderSync = require('../../render').renderSync;

extend.helper.register('strip_html', function(content){
  return content.toString().replace(/<[^>]*>/g, '');
});

extend.helper.register('trim', function(content){
  return content.toString().trim();
});

extend.helper.register('titlecase', util.titlecase);

extend.helper.register('markdown', function(text){
  return renderSync({text: text, engine: 'markdown'});
});

extend.helper.register('word_wrap', function(text, width){
  if (!width) width = 80;

  var arr = [];

  for (var i = 0, length = text.length; i < length; i += width){
    arr.push(text.substr(i, width));
  }

  return arr.join('\n');
});

extend.helper.register('truncate', function(text, length){
  return text.substring(0, length);
});

extend.helper.register('truncate_words', function(text, length){
  return text.split(' ').slice(0, length).join(' ');
});
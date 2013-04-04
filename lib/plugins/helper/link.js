var extend = require('../../extend');

extend.helper.register('link_to', function(path, text, external){
  return '<a href="' + path + '" title="' + (text ? text : path) + '"' + (external ? ' target="_blank" rel="external"' : '') + '>' + (text ? text : path) + '</a>';
});

extend.helper.register('mail_to', function(path, text){
  return '<a href="mailto:' + path + '" title="' + (text ? text : path) + '">' + (text ? text : path) + '</a>';
});
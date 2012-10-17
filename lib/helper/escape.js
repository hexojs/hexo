var extend = require('../extend');

extend.helper.register('escape', function(content){
  var result = content.toString()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;')
    .replace(/&(?!\w+;)/g, '&amp;');

  return result;
});
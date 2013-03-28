var extend = require('../../extend'),
  renderSync = require('../../render').renderSync;

extend.helper.register('markdown', function(text){
  return renderSync({text: text, engine: 'markdown'});
});
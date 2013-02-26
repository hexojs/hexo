var ejs = require('ejs'),
  extend = require('../../extend');

extend.renderer.register('ejs', 'html', function(data, locals){
  locals.filename = data.path;
  return ejs.render(data.text, locals);
}, true);
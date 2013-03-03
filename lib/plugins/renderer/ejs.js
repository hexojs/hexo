var ejs = require('ejs'),
  extend = require('../../extend');

extend.renderer.register('ejs', 'html', function(data, locals){
  return ejs.render(data.text, locals);
}, true);
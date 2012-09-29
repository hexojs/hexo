var ejs = require('ejs'),
  extend = require('../extend');

extend.renderer.register('ejs', function(file, content, locals, callback){
  callback(null, ejs.render(content, locals));
});
var swig = require('swig'),
  extend = require('../extend');

extend.renderer.register('swig', function(file, content, locals, callback){
  var tpl = swig.compile(content);
  callback(null, tpl(locals));
});
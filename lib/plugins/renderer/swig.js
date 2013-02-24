var swig = require('swig'),
  extend = require('../../extend');

extend.renderer.register('swig', 'html', function(file, content, locals){
  var tpl = swig.compile(content);
  return tpl(locals);
}, true);
var swig = require('swig'),
  extend = require('../../extend');

swig.init({
  filter: extend.filter.list()
});

extend.renderer.register('swig', 'html', function(file, content, locals){
  var tpl = swig.compile(content);
  return tpl(locals);
}, true);
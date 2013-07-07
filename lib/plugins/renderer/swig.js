var swig = require('swig'),
  extend = require('../../extend'),
  tags = extend.swig.list();

swig.init({tags: tags});

extend.renderer.register('swig', 'html', function(data, locals){
  return swig.compile(data.text)(locals);
}, true);
var swig = require('swig'),
  extend = require('../../extend');

extend.renderer.register('swig', 'html', function(data, locals){
  return swig.compile(data.text)(locals);
}, true);
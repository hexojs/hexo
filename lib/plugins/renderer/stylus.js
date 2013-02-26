var stylus = require('stylus'),
  nib = require('nib'),
  extend = require('../../extend');

var styl = function(data, options, callback){
  stylus(data.text).use(nib()).set('filename', data.path).render(callback);
};

extend.renderer.register('styl', 'css', styl);
extend.renderer.register('stylus', 'css', styl);
var stylus = require('stylus'),
  nib = require('nib'),
  extend = require('../extend');

var styl = function(file, content, callback){
  stylus(content).use(nib()).set('filename', file).render(callback);
};

extend.render.register('styl', 'css', styl);
extend.render.register('stylus', 'css', styl);
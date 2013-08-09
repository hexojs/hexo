var stylus = require('stylus'),
  nib = require('nib');

module.exports = function(data, options, callback){
  stylus(data.text).use(nib()).set('filename', data.path).render(callback);
};
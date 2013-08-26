var ExtendError = require('../error').ExtendError;

var Swig = module.exports = function(){
  this.store = {};
};

Swig.prototype.list = function(){
  return this.store;
};

Swig.prototype.register = function(name, fn, ends){
  if (typeof fn !== 'function'){
    throw new ExtendError('Swig function is not defined');
  }

  var swig = this.store[name] = fn;
  if (ends) swig.ends = true;
};
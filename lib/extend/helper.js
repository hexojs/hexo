var ExtendError = require('../error').ExtendError;

var Helper = module.exports = function(){
  this.store = {};
};

Helper.prototype.list = function(){
  return this.store;
};

Helper.prototype.register = function(name, fn){
  if (typeof fn !== 'function'){
    throw new ExtendError('Helper function is not defined');
  }

  this.store[name] = fn;
};
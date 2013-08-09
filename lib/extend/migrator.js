var ExtendError = require('../error').ExtendError;

var Migrator = module.exports = function(){
  this.store = {};
};

Migrator.prototype.list = function(){
  return this.store;
};

Migrator.prototype.register = function(name, fn){
  if (typeof fn !== 'function'){
    throw new ExtendError('Migrator function is not defined');
  }

  this.store[name] = fn;
};
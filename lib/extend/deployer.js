var ExtendError = require('../error').ExtendError;

var Deployer = module.exports = function(){
  this.store = {};
};

Deployer.prototype.list = function(){
  return this.store;
};

Deployer.prototype.register = function(name, fn){
  if (typeof fn !== 'function'){
    throw new ExtendError('Deployer function is not defined')
  }
  this.store[name] = fn;
};
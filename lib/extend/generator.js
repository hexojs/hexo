var ExtendError = require('../error').ExtendError;

var Generator = module.exports = function(){
  this.store = [];
};

Generator.prototype.list = function(){
  return this.store;
};

Generator.prototype.register = function(fn){
  if (typeof fn !== 'function'){
    throw new ExtendError('Generator function is not defined');
  }

  this.store.push(fn);
};
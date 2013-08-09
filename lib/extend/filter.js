var ExtendError = require('../error').ExtendError;

var Filter = module.exports = function(){
  this.store = {
    pre: [],
    post: []
  };
};

Filter.prototype.list = function(){
  return this.store;
};

Filter.prototype.register = function(name, fn){
  if (!fn){
    if (typeof name === 'function'){
      fn = name;
      name = 'post';
    } else {
      throw new ExtendError('Filter function is not defined')
    }
  }

  this.store[name].push(fn);
};
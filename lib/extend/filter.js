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

Filter.prototype.register = function(type, fn){
  if (!fn){
    if (typeof type === 'function'){
      fn = type;
      type = 'post';
    } else {
      throw new ExtendError('Filter function is not defined')
    }
  }

  if (type !== 'pre' && type !== 'post'){
    throw new ExtendError('Filter type must be either pre or post');
  }

  this.store[type].push(fn);
};
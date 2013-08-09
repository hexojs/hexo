var ExtendError = require('../error').ExtendError;

var Processor = module.exports = function(){
  this.store = [];
};

Processor.prototype.list = function(){
  return this.store;
};

Processor.prototype.register = function(rule, fn){
  if (!fn){
    if (typeof rule === 'function'){
      fn = rule;
      rule = '';
    } else {
      throw new ExtendError('Processor function is not defined');
    }
  }

  fn.rule = rule;
  this.store.push(fn);
};
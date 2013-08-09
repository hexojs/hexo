var ExtendError = require('../error').ExtendError;

var Console = module.exports = function(){
  this.store = {};
};

Console.prototype.list = function(){
  return this.store;
};

Console.prototype.register = function(name, desc, options, fn){
  if (!fn){
    if (typeof options === 'function'){
      fn = options;
      options = {};
    } else {
      throw new ExtendError('Console function is not defined');
    }
  }

  var console = this.store[name.toLowerCase()] = fn;
  console.desc = desc;
  console.options = options;

  if (options.alias) this.store[options.alias] = console;
};
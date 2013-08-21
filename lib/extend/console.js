var _ = require('lodash'),
  ExtendError = require('../error').ExtendError;

var Console = module.exports = function(){
  this.store = {};
  this.alias = {};
};

Console.prototype.get = function(name){
  name = name.toLowerCase();

  return this.store[name] || this.alias[name];
};

Console.prototype.list = function(){
  return this.store;
};

Console.prototype.register = function(name, desc, options, fn){
  if (!fn){
    if (options){
      if (typeof options === 'function'){
        fn = options;

        if (_.isObject(desc)){ // name, options, fn
          options = desc;
          desc = '';
        } else { // name, desc, fn
          options = {};
        }
      } else {
        throw new ExtendError('Console function is not defined');
      }
    } else {
      // name, fn
      if (typeof desc === 'function'){
        fn = desc;
        options = {};
        desc = '';
      } else {
        throw new ExtendError('Console function is not defined');
      }
    }
  }

  var console = this.store[name.toLowerCase()] = fn;
  console.desc = desc;
  console.options = options;

  if (options.alias) this.alias[options.alias] = console;
};
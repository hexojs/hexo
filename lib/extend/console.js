'use strict';

var Promise = require('bluebird');
var abbrev = require('abbrev');

function Console(){
  this.store = {};
  this.alias = {};
}

Console.prototype.get = function(name){
  name = name.toLowerCase();
  return this.store[this.alias[name]];
};

Console.prototype.list = function(){
  return this.store;
};

Console.prototype.register = function(name, desc, options, fn){
  if (!name) throw new TypeError('name is required');

  if (!fn){
    if (options){
      if (typeof options === 'function'){
        fn = options;

        if (typeof desc === 'object'){ // name, options, fn
          options = desc;
          desc = '';
        } else { // name, desc, fn
          options = {};
        }
      } else {
        throw new TypeError('fn must be a function');
      }
    } else {
      // name, fn
      if (typeof desc === 'function'){
        fn = desc;
        options = {};
        desc = '';
      } else {
        throw new TypeError('fn must be a function');
      }
    }
  }

  if (fn.length > 1){
    fn = Promise.promisify(fn);
  } else {
    fn = Promise.method(fn);
  }

  var c = this.store[name.toLowerCase()] = fn;
  c.options = options;
  c.desc = desc;

  this.alias = abbrev(Object.keys(this.store));
};

module.exports = Console;
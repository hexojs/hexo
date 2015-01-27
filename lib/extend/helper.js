'use strict';

function Helper(){
  this.store = {};
}

Helper.prototype.list = function(){
  return this.store;
};

Helper.prototype.get = function(name){
  return this.store[name];
};

Helper.prototype.register = function(name, fn){
  if (!name) throw new TypeError('name is required');
  if (typeof fn !== 'function') throw new TypeError('fn must be a function');

  this.store[name] = fn;
};

module.exports = Helper;
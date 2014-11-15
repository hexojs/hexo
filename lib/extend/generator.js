var Promise = require('bluebird');

function Generator(){
  this.id = 0;
  this.store = {};
}

Generator.prototype.list = function(){
  return this.store;
};

Generator.prototype.register = function(name, fn){
  if (!fn){
    if (typeof name === 'function'){
      fn = name;
      name = 'generator=' + this.id++;
    } else {
      throw new TypeError('fn must be a function');
    }
  }

  if (fn.length > 2) fn = Promise.promisify(fn);
  this.store[name] = fn;
};

module.exports = Generator;
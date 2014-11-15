var Promise = require('bluebird');

function Deployer(){
  this.store = {};
}

Deployer.prototype.list = function(){
  return this.store;
};

Deployer.prototype.register = function(name, fn){
  if (!name) throw new TypeError('name is required');
  if (typeof fn !== 'function') throw new TypeError('fn must be a function');

  if (fn.length > 1) fn = Promise.promisify(fn);
  this.store[name] = fn;
};

module.exports = Deployer;
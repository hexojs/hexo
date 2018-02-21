'use strict';

const Promise = require('bluebird');

function Migrator() {
  this.store = {};
}

Migrator.prototype.list = function() {
  return this.store;
};

Migrator.prototype.get = function(name) {
  return this.store[name];
};

Migrator.prototype.register = function(name, fn) {
  if (!name) throw new TypeError('name is required');
  if (typeof fn !== 'function') throw new TypeError('fn must be a function');

  if (fn.length > 1) {
    fn = Promise.promisify(fn);
  } else {
    fn = Promise.method(fn);
  }

  this.store[name] = fn;
};

module.exports = Migrator;

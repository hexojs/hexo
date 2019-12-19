'use strict';

const Promise = require('bluebird');

class Deployer {
  constructor() {
    this.store = {};
  }

  list() {
    return this.store;
  }

  get(name) {
    return this.store[name];
  }

  register(name, fn) {
    if (!name) throw new TypeError('name is required');
    if (typeof fn !== 'function') throw new TypeError('fn must be a function');

    if (fn.length > 1) {
      fn = Promise.promisify(fn);
    } else {
      fn = Promise.method(fn);
    }

    this.store[name] = fn;
  }
}

module.exports = Deployer;

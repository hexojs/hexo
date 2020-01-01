'use strict';

class Helper {
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

    this.store[name] = fn;
  }
}

module.exports = Helper;

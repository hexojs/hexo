'use strict';

class Helper {
  constructor() {
    this.store = {};
    this.prop = {};
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

  setProp(name, prop) {
    if (!name) throw new TypeError('name is required');
    if (!prop) throw new TypeError('prop is required');

    this.prop[name] = prop;
  }

  getProp(name) {
    return this.prop[name];
  }
}

module.exports = Helper;

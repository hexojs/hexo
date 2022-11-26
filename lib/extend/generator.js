'use strict';

const Promise = require('bluebird');

class Generator {
  constructor() {
    this.id = 0;
    this.store = {};
  }

  list() {
    return this.store;
  }

  get(name) {
    return this.store[name];
  }

  register(name, fn) {
    if (!fn) {
      if (typeof name === 'function') {
        fn = name;
        name = `generator-${this.id++}`;
      } else {
        throw new TypeError('fn must be a function');
      }
    }

    if (fn.length > 1) fn = Promise.promisify(fn);
    this.store[name] = Promise.method(fn);
  }
}

module.exports = Generator;

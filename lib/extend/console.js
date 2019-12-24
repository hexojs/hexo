'use strict';

const Promise = require('bluebird');
const abbrev = require('abbrev');

class Console {
  constructor() {
    this.store = {};
    this.alias = {};
  }

  get(name) {
    name = name.toLowerCase();
    return this.store[this.alias[name]];
  }

  list() {
    return this.store;
  }

  register(name, desc, options, fn) {
    if (!name) throw new TypeError('name is required');

    if (!fn) {
      if (options) {
        if (typeof options === 'function') {
          fn = options;

          if (typeof desc === 'object') { // name, options, fn
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
        if (typeof desc === 'function') {
          fn = desc;
          options = {};
          desc = '';
        } else {
          throw new TypeError('fn must be a function');
        }
      }
    }

    if (fn.length > 1) {
      fn = Promise.promisify(fn);
    } else {
      fn = Promise.method(fn);
    }

    const c = fn;
    this.store[name.toLowerCase()] = c;
    c.options = options;
    c.desc = desc;

    this.alias = abbrev(Object.keys(this.store));
  }
}

module.exports = Console;

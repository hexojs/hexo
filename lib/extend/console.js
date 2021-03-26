'use strict';

const Promise = require('bluebird');
const abbrev = require('abbrev');

/**
 * Console plugin option
 * @typedef {Object} Option
 * @property {String} usage - The usage of a console command
 * @property {{name: String, desc: String}[]} arguments - The description of each argument of a console command
 * @property {{name: String, desc: String}[]} options - The description of each option of a console command
 */

class Console {
  constructor() {
    this.store = {};
    this.alias = {};
  }

  /**
   * Get a console plugin function by name
   * @param {String} name - The name of the console plugin
   * @returns {Function} - The console plugin function
   */
  get(name) {
    name = name.toLowerCase();
    return this.store[this.alias[name]];
  }

  list() {
    return this.store;
  }

  /**
   * Register a console plugin
   * @param {String} name - The name of console plugin to be registered
   * @param {String} desc - More detailed information about a console command
   * @param {Option} options - The description of each option of a console command
   * @param {Function} fn - The console plugin to be registered
   */
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

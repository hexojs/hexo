'use strict';

class SyntaxHighlight {
  constructor() {
    this.store = {};
  }

  register(name, fn) {
    if (typeof fn !== 'function') throw new TypeError('fn must be a function');

    this.store[name] = fn;
  }

  query(name) {
    return name && this.store[name];
  }

  exec(name, options) {
    const fn = this.store[name];

    if (!fn) throw new TypeError(`syntax highlighter ${name} is not registered`);
    const ctx = options.context;
    const args = options.args || [];

    return Reflect.apply(fn, ctx, args);
  }
}

module.exports = SyntaxHighlight;

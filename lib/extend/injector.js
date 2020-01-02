'use strict';

class Injector {
  constructor() {
    this.store = {
      head_start: new Set(),
      head_end: new Set(),
      body_begin: new Set(),
      body_end: new Set()
    };
  }

  list() {
    return this.store;
  }

  get(entry) {
    return [...this.store[entry]];
  }

  register(entry, value) {
    if (!entry) throw new TypeError('entry is required');
    if (typeof value === 'function') value = value();

    this.store[entry].add(value);
  }
}

module.exports = Injector;

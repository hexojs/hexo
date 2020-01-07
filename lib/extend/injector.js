'use strict';

class Injector {
  constructor() {
    this.store = {
      head_begin: {},
      head_end: {},
      body_begin: {},
      body_end: {}
    };
  }

  list() {
    return this.store;
  }

  get(entry, to = 'default') {
    return Array.from(this.store[entry][to] || []);
  }

  getText(entry, to = 'default') {
    const arr = this.get(entry, to);
    if (!arr || !arr.length) return '';
    return arr.join('');
  }

  register(entry, value, to = 'default') {
    if (!entry) throw new TypeError('entry is required');
    if (typeof value === 'function') value = value();

    const entryMap = this.store[entry] || this.store.head_end;
    const valueSet = entryMap[to] || new Set();
    valueSet.add(value);
    entryMap[to] = valueSet;
  }
}

module.exports = Injector;

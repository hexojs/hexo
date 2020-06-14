'use strict';

const { extname } = require('path');
const Promise = require('bluebird');

const getExtname = str => {
  if (typeof str !== 'string') return '';

  const ext = extname(str) || str;
  return ext.startsWith('.') ? ext.slice(1) : ext;
};

class Renderer {
  constructor() {
    this.store = {};
    this.storeSync = {};
  }

  list(sync) {
    return sync ? this.storeSync : this.store;
  }

  get(name, sync) {
    const store = this[sync ? 'storeSync' : 'store'];

    return store[getExtname(name)] || store[name];
  }

  isRenderable(path) {
    return Boolean(this.get(path));
  }

  isRenderableSync(path) {
    return Boolean(this.get(path, true));
  }

  getOutput(path) {
    const renderer = this.get(path);
    return renderer ? renderer.output : '';
  }

  register(name, output, fn, sync) {
    if (!name) throw new TypeError('name is required');
    if (!output) throw new TypeError('output is required');
    if (typeof fn !== 'function') throw new TypeError('fn must be a function');

    name = getExtname(name);
    output = getExtname(output);

    if (sync) {
      this.storeSync[name] = fn;
      this.storeSync[name].output = output;

      this.store[name] = Promise.method(fn);
    } else {
      if (fn.length > 2) fn = Promise.promisify(fn);
      this.store[name] = fn;
    }

    this.store[name].output = output;
    this.store[name].compile = fn.compile;
  }
}

module.exports = Renderer;

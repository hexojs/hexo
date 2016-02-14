'use strict';

var pathFn = require('path');
var Promise = require('bluebird');

function getExtname(str) {
  var extname = pathFn.extname(str) || str;
  return extname[0] === '.' ? extname.slice(1) : extname;
}

function Renderer() {
  this.store = {};
  this.storeSync = {};
}

Renderer.prototype.list = function(sync) {
  return sync ? this.storeSync : this.store;
};

Renderer.prototype.get = function(name, sync) {
  var store = this[sync ? 'storeSync' : 'store'];

  return store[getExtname(name)] || store[name];
};

Renderer.prototype.isRenderable = function(path) {
  return Boolean(this.get(path));
};

Renderer.prototype.isRenderableSync = function(path) {
  return Boolean(this.get(path, true));
};

Renderer.prototype.getOutput = function(path) {
  var renderer = this.get(path);
  return renderer ? renderer.output : '';
};

Renderer.prototype.register = function(name, output, fn, sync) {
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
};

module.exports = Renderer;

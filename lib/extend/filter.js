'use strict';

const Promise = require('bluebird');

const typeAlias = {
  pre: 'before_post_render',
  post: 'after_post_render'
};

function Filter() {
  this.store = {};
}

Filter.prototype.list = function(type) {
  if (!type) return this.store;
  return this.store[type] || [];
};

Filter.prototype.register = function(type, fn, priority) {
  if (!priority) {
    if (typeof type === 'function') {
      priority = fn;
      fn = type;
      type = 'after_post_render';
    }
  }

  if (typeof fn !== 'function') throw new TypeError('fn must be a function');

  type = typeAlias[type] || type;
  priority = priority == null ? 10 : priority;

  this.store[type] = this.store[type] || [];
  const store = this.store[type] || [];

  fn.priority = priority;
  store.push(fn);

  store.sort((a, b) => a.priority - b.priority);
};

Filter.prototype.unregister = function(type, fn) {
  if (!type) throw new TypeError('type is required');
  if (typeof fn !== 'function') throw new TypeError('fn must be a function');

  const list = this.list(type);
  if (!list || !list.length) return;

  const index = list.indexOf(fn);

  if (index !== -1) list.splice(index, 1);
};

Filter.prototype.exec = function(type, data, options = {}) {
  const filters = this.list(type);
  const ctx = options.context;
  const args = options.args || [];

  args.unshift(data);

  return Promise.each(filters, filter => Reflect.apply(Promise.method(filter), ctx, args).then(result => {
    args[0] = result == null ? args[0] : result;
    return args[0];
  })).then(() => args[0]);
};

Filter.prototype.execSync = function(type, data, options = {}) {
  const filters = this.list(type);
  const ctx = options.context;
  const args = options.args || [];

  args.unshift(data);

  for (let i = 0, len = filters.length; i < len; i++) {
    const result = Reflect.apply(filters[i], ctx, args);
    args[0] = result == null ? args[0] : result;
  }

  return args[0];
};

module.exports = Filter;

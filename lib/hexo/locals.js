'use strict';

function Locals() {
  this.cache = {};
  this.getters = {};
}

Locals.prototype.get = function(name) {
  if (typeof name !== 'string') throw new TypeError('name must be a string!');

  var cache = this.cache[name];

  if (cache == null) {
    var getter = this.getters[name];
    if (!getter) return;

    cache = this.cache[name] = getter();
  }

  return cache;
};

Locals.prototype.set = function(name, value) {
  if (typeof name !== 'string') throw new TypeError('name must be a string!');
  if (value == null) throw new TypeError('value is required!');

  var getter;

  if (typeof value === 'function') {
    getter = value;
  } else {
    getter = function() {
      return value;
    };
  }

  this.getters[name] = getter;
  this.cache[name] = null;

  return this;
};

Locals.prototype.remove = function(name) {
  if (typeof name !== 'string') throw new TypeError('name must be a string!');

  this.getters[name] = null;
  this.cache[name] = null;

  return this;
};

Locals.prototype.invalidate = function() {
  this.cache = {};

  return this;
};

Locals.prototype.toObject = function() {
  var result = {};
  var keys = Object.keys(this.getters);
  var key = '';
  var item;

  for (var i = 0, len = keys.length; i < len; i++) {
    key = keys[i];
    item = this.get(key);

    if (item != null) result[key] = item;
  }

  return result;
};

module.exports = Locals;

'use strict';

const Promise = require('bluebird');
const Pattern = require('hexo-util').Pattern;

function Processor() {
  this.store = [];
}

Processor.prototype.list = function() {
  return this.store;
};

Processor.prototype.register = function(pattern, fn) {
  if (!fn) {
    if (typeof pattern === 'function') {
      fn = pattern;
      pattern = /(.*)/;
    } else {
      throw new TypeError('fn must be a function');
    }
  }

  if (fn.length > 1) {
    fn = Promise.promisify(fn);
  } else {
    fn = Promise.method(fn);
  }

  this.store.push({
    pattern: new Pattern(pattern),
    process: fn
  });
};

module.exports = Processor;

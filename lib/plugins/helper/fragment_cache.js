'use strict';

module.exports = ctx => {
  const cache = {};

  return function fragmentCache(id, fn) {
    if (this.cache && cache[id] != null) return cache[id];

    cache[id] = fn();
    const result = fn();
    return result;
  };
};

'use strict';

module.exports = ctx => {
  let cache = {};

  ctx.on('generateBefore', function() {
    // reset cache for watch mode
    cache = {};
  });

  return function fragmentCache(id, fn) {
    if (this.cache && cache[id] != null) return cache[id];

    const result = cache[id] = fn();
    return result;
  };
};

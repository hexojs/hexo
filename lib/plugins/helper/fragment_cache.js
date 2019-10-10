'use strict';

module.exports = ctx => {
  let cache = {};

  // reset cache for watch mode
  ctx.on('generateBefore', () => { cache = {}; });

  return function fragmentCache(id, fn) {
    if (this.cache && cache[id] != null) return cache[id];

    const result = cache[id] = fn();
    return result;
  };
};

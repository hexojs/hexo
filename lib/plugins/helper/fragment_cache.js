'use strict';

const LRU = require('node-lfu-cache');

module.exports = ctx => {
  const cache = new LRU(50);

  // reset cache for watch mode
  ctx.on('generateBefore', () => { cache.reset(); });

  return function fragmentCache(id, fn) {
    if (this.cache && cache.has(id)) return cache.get(id);

    const result = fn();
    cache.set(id, result);
    return result;
  };
};

import { Cache } from 'hexo-util';
import type Hexo from '../../hexo/index.js';

const fragmentCacheHelper = (ctx: Hexo) => {
  const cache = new Cache();

  // reset cache for watch mode
  ctx.on('generateBefore', () => { cache.flush(); });

  return function fragmentCache(id: string, fn: () => any) {
    if (this.cache) return cache.apply(id, fn);

    const result = fn();

    cache.set(id, result);
    return result;
  };
};

export default fragmentCacheHelper;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = fragmentCacheHelper;
  module.exports.default = fragmentCacheHelper;
}

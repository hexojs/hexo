import { Cache } from 'hexo-util';
import type Hexo from '../../hexo';

export = (ctx: Hexo) => {
  const cache = new Cache();

  // reset cache for watch mode
  ctx.on('generateBefore', () => { cache.flush(); });

  return function fragmentCache(id, fn) {
    if (this.cache) return cache.apply(id, fn);

    const result = fn();

    cache.set(id, result);
    return result;
  };
};

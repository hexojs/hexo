import { dirname } from 'path';
import { fileURLToPath } from 'url';
import Hexo from '../../../lib/hexo';
import fragmentCache from '../../../lib/plugins/helper/fragment_cache';

// Cross-compatible __dirname for ESM and CJS, without require
let __hexo_dirname: string;
if (typeof __dirname !== 'undefined') {
  // CJS
  __hexo_dirname = __dirname;
} else {
  // ESM (only works in ESM context)
  let url = '';
  try {
    // @ts-ignore: import.meta.url is only available in ESM, safe to ignore in CJS
    url = import.meta.url;
  } catch {}
  __hexo_dirname = url ? dirname(fileURLToPath(url)) : '';
}

describe('fragment_cache', () => {
  const hexo = new Hexo(__hexo_dirname);
  const fragment_cache = fragmentCache(hexo);

  fragment_cache.call({cache: true}, 'foo', () => 123);

  it('cache enabled', () => {
    fragment_cache.call({cache: true}, 'foo').should.eql(123);
  });

  it('cache disabled', () => {
    fragment_cache.call({cache: false}, 'foo', () => 456).should.eql(456);
  });

  it('should reset cache on generateBefore', () => {
    fragment_cache.call({cache: true}, 'foo', () => 789).should.eql(456);
    // reset cache
    hexo.emit('generateBefore');
    fragment_cache.call({cache: true}, 'foo', () => 789).should.eql(789);
  });
});

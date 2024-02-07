import Hexo from '../../../lib/hexo';
import fragmentCache from '../../../lib/plugins/helper/fragment_cache';

describe('fragment_cache', () => {
  const hexo = new Hexo(__dirname);
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

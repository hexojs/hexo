'use strict';

describe('fragment_cache', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(__dirname);
  const fragment_cache = require('../../../lib/plugins/helper/fragment_cache')(hexo);

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

  it('should delete oldest & coldest cache when meet size limit', () => {
    fragment_cache.call({cache: true}, 'cold', () => 123);
    for (let i = 1; i <= 10; i++) {
      fragment_cache.call({cache: true}, 'hot', () => 456);
    }

    const random = (min, max) => Math.round(Math.random() * (max - min)) + min;
    for (let i = 1; i <= 60; i++) {
      fragment_cache.call({cache: true}, String(100 + i), () => random(100, 900));
    }

    // The cold cache should be deleted
    fragment_cache.call({cache: true}, 'cold', () => 789).should.eql(789);
    // The hot cache should not be deleted
    fragment_cache.call({cache: true}, 'hot', () => 789).should.eql(456);
  });
});

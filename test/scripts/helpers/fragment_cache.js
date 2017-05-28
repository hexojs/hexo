var should = require('chai').should(); // eslint-disable-line

describe('fragment_cache', () => {
  var fragment_cache = require('../../../lib/plugins/helper/fragment_cache')();

  fragment_cache.call({cache: true}, 'foo', () => 123);

  it('cache enabled', () => {
    fragment_cache.call({cache: true}, 'foo').should.eql(123);
  });

  it('cache disabled', () => {
    fragment_cache.call({cache: false}, 'foo', () => 456).should.eql(456);
  });
});

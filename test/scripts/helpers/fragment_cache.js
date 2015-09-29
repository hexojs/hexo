'use strict';

var should = require('chai').should(); // eslint-disable-line

describe('fragment_cache', function() {
  var fragment_cache = require('../../../lib/plugins/helper/fragment_cache')();

  fragment_cache.call({cache: true}, 'foo', function() {
    return 123;
  });

  it('cache enabled', function() {
    fragment_cache.call({cache: true}, 'foo').should.eql(123);
  });

  it('cache disabled', function() {
    fragment_cache.call({cache: false}, 'foo', function() {
      return 456;
    }).should.eql(456);
  });
});

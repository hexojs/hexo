'use strict';

var should = require('chai').should(); // eslint-disable-line

describe('SchemaTypeCacheString', function() {
  var SchemaTypeCacheString = require('../../../lib/models/types/cachestring');
  var type = new SchemaTypeCacheString('test');

  it('value()', function() {
    should.not.exist(type.value(''));
    should.not.exist(type.value('foo'));
  });
});

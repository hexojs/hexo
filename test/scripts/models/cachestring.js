'use strict';

var should = require('chai').should();

describe('SchemaTypeCacheString', function(){
  var SchemaTypeCacheString = require('../../../lib/models/types/cachestring');
  var type = new SchemaTypeCacheString('test');

  it('value()', function(){
    should.not.exist(type.value(''));
    should.not.exist(type.value('foo'));
  });
});
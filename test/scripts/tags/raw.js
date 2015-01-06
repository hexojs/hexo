var should = require('chai').should();

describe('raw', function(){
  var raw = require('../../../lib/plugins/tag/raw');

  it('content', function(){
    var content = '123456789<b>strong</b>987654321';
    raw([], content).should.eql(content);
  });
});
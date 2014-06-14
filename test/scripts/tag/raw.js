var should = require('chai').should();

describe('raw', function(){
  var raw = require('../../../lib/plugins/tag/raw');

  it('content', function(){
    raw([], '123456789<b>strong</b>987654321').should.eql('123456789<b>strong</b>987654321');
  });
});
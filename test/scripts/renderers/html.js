var should = require('chai').should();

describe('html', function(){
  var r = require('../../../lib/plugins/renderer/html');

  it('normal', function(){
    r({text: '123'}).should.eql('123');
  });
});
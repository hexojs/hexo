'use strict';

var should = require('chai').should();

describe('plain', function(){
  var r = require('../../../lib/plugins/renderer/plain');

  it('normal', function(){
    r({text: '123'}).should.eql('123');
  });
});
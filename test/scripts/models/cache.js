'use strict';

var should = require('chai').should();
var assert = require('chai').assert;

describe('Cache', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var Cache = hexo.model('Cache');

  it('_id - required', function(){
    return Cache.insert({}).then(function(){
      assert.fail();
    }).catch(function(err){
      err.should.have.property('message', 'ID is not defined');
    });
  });
});
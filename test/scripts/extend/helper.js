'use strict';

var should = require('chai').should();

describe('Helper', function(){
  var Helper = require('../../../lib/extend/helper');

  it('register()', function(){
    var h = new Helper();

    // name, fn
    h.register('test', function(){});
    h.get('test').should.exist;

    // no fn
    try {
      h.register('test');
    } catch (err){
      err.should.be
        .instanceOf(TypeError)
        .property('message', 'fn must be a function');
    }

    // no name
    try {
      h.register();
    } catch (err){
      err.should.be
        .instanceOf(TypeError)
        .property('message', 'name is required');
    }
  });

  it('list()', function(){
    var h = new Helper();

    h.register('test', function(){});
    h.list().should.have.keys(['test']);
  });

  it('get()', function(){
    var h = new Helper();

    h.register('test', function(){});
    h.get('test').should.exist;
  });
});
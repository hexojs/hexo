'use strict';

var should = require('chai').should();

describe('Console', function(){
  var Console = require('../../../lib/extend/console');

  it('register()', function(){
    var c = new Console();

    // no name
    try {
      c.register();
    } catch (err){
      err.should.be
        .instanceOf(TypeError)
        .property('message', 'name is required');
    }

    // name, fn
    c.register('test', function(){});
    c.get('test').should.exist;

    // name, not fn
    try {
      c.register('test');
    } catch (err){
      err.should.be
        .instanceOf(TypeError)
        .property('message', 'fn must be a function');
    }

    // name, desc, fn
    c.register('test', 'this is a test', function(){});
    c.get('test').should.exist;
    c.get('test').desc.should.eql('this is a test');

    // name, desc, not fn
    try {
      c.register('test', 'this is a test');
    } catch (err){
      err.should.be
        .instanceOf(TypeError)
        .property('message', 'fn must be a function');
    }

    // name, desc, options, fn
    c.register('test', 'this is a test', {init: true}, function(){});
    c.get('test').should.exist;
    c.get('test').desc.should.eql('this is a test');
    c.get('test').options.init.should.be.true;

    // name, desc, options, not fn
    try {
      c.register('test', 'this is a test', {init: true});
    } catch (err){
      err.should.be
        .instanceOf(TypeError)
        .property('message', 'fn must be a function');
    }
  });

  it('register() - alias', function(){
    var c = new Console();

    c.register('test', function(){});
    c.alias.should.eql({
      t: 'test',
      te: 'test',
      tes: 'test',
      test: 'test'
    });
  });

  it('register() - promisify', function(){
    var c = new Console();

    c.register('test', function(args, callback){
      args.should.eql({foo: 'bar'});
      callback(null, 'foo');
    });

    c.get('test')({
      foo: 'bar'
    }).then(function(result){
      result.should.eql('foo');
    });
  });

  it('list()', function(){
    var c = new Console();

    c.register('test', function(){});
    c.list().should.have.keys(['test']);
  });

  it('get()', function(){
    var c = new Console();

    c.register('test', function(){});
    c.get('test').should.exist;
    c.get('t').should.exist;
    c.get('te').should.exist;
    c.get('tes').should.exist;
  });
});
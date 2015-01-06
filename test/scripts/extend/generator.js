var should = require('chai').should();

describe('Generator', function(){
  var Generator = require('../../../lib/extend/generator');

  it('register()', function(){
    var g = new Generator();

    // name, fn
    g.register('test', function(){});
    g.get('test').should.exist;

    // fn
    g.register(function(){});
    g.get('generator-0').should.exist;

    // no fn
    try {
      g.register('test');
    } catch (err){
      err.should.be
        .instanceOf(TypeError)
        .property('message', 'fn must be a function');
    }
  });

  it('register() - promisify', function(){
    var g = new Generator();

    g.register('test', function(locals, render, callback){
      callback(null, 'foo');
    });

    g.get('test')({}, {}).then(function(result){
      result.should.eql('foo');
    });
  });

  it('get()', function(){
    var g = new Generator();

    g.register('test', function(){});
    g.get('test').should.exist;
  });

  it('list()', function(){
    var g = new Generator();

    g.register('test', function(){});
    g.list().should.have.keys(['test']);
  });
});
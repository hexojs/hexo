var should = require('chai').should();

describe('router', function(){
  var Router = require('../../../lib/core/router'),
    router;

  before(function(){
    router = new Router();
  });

  it('format', function(){
    router.format('foo').should.eql('foo');

    // Remove prefixed slashes
    router.format('/foo').should.eql('foo');
    router.format('///foo').should.eql('foo');

    // Append `index.html` to the URL with trailing slash
    router.format('foo/').should.eql('foo/index.html');

    // '' => `index.html
    router.format('').should.eql('index.html');
    router.format().should.eql('index.html');

    // Remove backslashes
    router.format('foo\\bar').should.eql('foo/bar');
    router.format('foo\\bar\\').should.eql('foo/bar/index.html');

    // Remove query string
    router.format('foo?a=1&b=2').should.eql('foo');
  });

  it('set: string', function(done){
    router.once('update', function(source, route){
      source.should.eql('foo');

      route(function(err, content){
        should.not.exist(err);
        content.should.eql('bar');
      });

      done();
    });

    router.set('foo', 'bar');
    router.get('foo', function(err, content){
      should.not.exist(err);
      content.should.eql('bar');
    });
  });

  it('set: function', function(done){
    router.once('update', function(source, route){
      source.should.eql('hello');

      route(function(err, content){
        should.not.exist(err);
        content.should.eql('world');
      });

      done();
    });

    router.set('hello', function(fn){
      fn(null, 'world');
    });

    router.get('hello', function(err, content){
      should.not.exist(err);
      content.should.eql('world');
    });
  });

  it('remove', function(done){
    router.once('remove', function(source){
      source.should.eql('hello');
      done();
    });

    router.remove('hello');
    should.not.exist(router.get('hello'));
  });
});
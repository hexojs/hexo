var Router = require('../lib/router'),
  should = require('should');

describe('Router', function(){
  var router = new Router();

  it('format()', function(){
    router.format('/foo/bar').should.eql('foo/bar');
    router.format('foo/bar/').should.eql('foo/bar/index.html');
    router.format('').should.eql('index.html');
  });

  it('set() - string', function(){
    router.set('foo', 'string');
  });

  it('set() - function', function(){
    var callback = function(){
      return 'string';
    };

    callback.modified = true;

    router.set('bar', callback);
  });

  it('get()', function(){
    router.get('foo')(function(err, result){
      should.not.exist(err);

      result.should.eql('string');
    });

    var route = router.get('bar');

    route.modified.should.be.true;

    route(function(err, result){
      should.not.exist(err);

      result.should.eql('string');
    });
  });

  it('remove()', function(){
    router.remove('foo');

    should.not.exist(router.get('foo'));
  });
});
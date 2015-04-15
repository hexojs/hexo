'use strict';

var should = require('chai').should();
var assert = require('chai').assert;
var Promise = require('bluebird');
var Readable = require('stream').Readable;
var pathFn = require('path');
var crypto = require('crypto');
var fs = require('hexo-fs');
var sinon = require('sinon');
var testUtil = require('../../util');

describe('Router', function(){
  var Router = require('../../../lib/hexo/router');
  var router = new Router();

  function checkStream(stream, expected){
    return testUtil.stream.read(stream).then(function(data){
      data.should.eql(expected);
    });
  }

  function checksum(stream){
    return new Promise(function(resolve, reject){
      var hash = crypto.createHash('sha1');

      stream.on('readable', function(){
        var chunk;

        while ((chunk = stream.read()) !== null){
          hash.update(chunk);
        }
      }).on('end', function(){
        resolve(hash.digest('hex'));
      }).on('error', reject);
    });
  }

  it('format()', function(){
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

  it('format() - path must be a string', function(){
    try {
      router.format(function(){});
      assert.fail();
    } catch (err){
      err.should.have.property('message', 'path must be a string!');
    }
  })

  it('set() - string', function(){
    var listener = sinon.spy(function(path){
      path.should.eql('test');
    });

    router.once('update', listener);

    router.set('test', 'foo');
    var data = router.get('test');

    data.modified.should.be.true;
    listener.calledOnce.should.be.true;
    return checkStream(data, 'foo');
  });

  it('set() - function', function(){
    router.set('test', function(){
      return 'foo';
    });

    return checkStream(router.get('test'), 'foo');
  });

  it('set() - function (callback style)', function(){
    router.set('test', function(callback){
      callback(null, 'foo');
    });

    return checkStream(router.get('test'), 'foo');
  });

  it('set() - readable stream', function(){
    // Prepare a readable stream
    var stream = new Readable();
    stream.push('foo');
    stream.push(null);

    router.set('test', function(){
      return stream;
    });

    return checkStream(router.get('test'), 'foo');
  });

  it('set() - modified', function(){
    router.set('test', {
      data: '',
      modified: false
    });

    router.isModified('test').should.be.false;
  });

  it('set() - path must be a string', function(){
    try {
      router.set();
      assert.fail();
    } catch (err){
      err.should.have.property('message', 'path must be a string!');
    }
  });

  it('set() - data is required', function(){
    try {
      router.set('test');
      assert.fail();
    } catch (err){
      err.should.have.property('message', 'data is required!');
    }
  });

  it('get() - error handling', function(){
    router.set('test', function(){
      throw new Error('error test');
    });

    return testUtil.stream.read(router.get('test')).then(function(){
      assert.fail();
    }).catch(function(err){
      err.should.have.property('message', 'error test');
    });
  });

  it('get() - no data', function(){
    router.set('test', function(){
      return;
    });

    return checkStream(router.get('test'), '');
  });

  it('get() - empty readable stream', function(){
    var stream = new Readable();
    stream.push(null);

    router.set('test', function(){
      return stream;
    });

    return checkStream(router.get('test'), '');
  });

  it('get() - large readable stream (more than 65535 bits)', function(){
    var path = pathFn.join(__dirname, '../../fixtures/banner.jpg');

    router.set('test', function(){
      return fs.createReadStream(path);
    });

    return Promise.all([
      checksum(router.get('test')),
      checksum(fs.createReadStream(path))
    ]).then(function(data){
      data[0].should.eql(data[1]);
    });
  });

  it('get() - path must be a string', function(){
    try {
      router.get();
      assert.fail();
    } catch (err){
      err.should.have.property('message', 'path must be a string!');
    }
  });

  it('get() - export stringified JSON object', function(){
    var obj = {foo: 1, bar: 2};

    router.set('test', function(){
      return obj;
    });

    return checkStream(router.get('test'), JSON.stringify(obj));
  });

  it('list()', function(){
    var router = new Router();

    router.set('foo', 'foo');
    router.set('bar', 'bar');
    router.set('baz', 'baz');
    router.remove('bar');

    router.list().should.eql(['foo', 'baz']);
  });

  it('isModified()', function(){
    router.set('test', 'foo');
    router.isModified('test').should.be.true;
  });

  it('isModified() - path must be a string', function(){
    try {
      router.isModified();
      assert.fail();
    } catch (err){
      err.should.have.property('message', 'path must be a string!');
    }
  });

  it('remove()', function(){
    var listener = sinon.spy(function(path){
      path.should.eql('test');
    });

    router.once('remove', listener);

    router.set('test', 'foo');
    router.remove('test');
    should.not.exist(router.get('test'));
    listener.calledOnce.should.be.true;
  });

  it('remove() - path must be a string', function(){
    try {
      router.remove();
      assert.fail();
    } catch (err){
      err.should.have.property('message', 'path must be a string!');
    }
  });
});
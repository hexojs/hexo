var should = require('chai').should();
var pathFn = require('path');
var Promise = require('bluebird');
var fs = require('hexo-fs');
var yaml = require('js-yaml');

describe('File', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);
  var Box = require('../../../lib/box');
  var box = new Box(hexo, __dirname);
  var target = pathFn.join(__dirname, '../../fixtures/test.yml');
  var body, obj, file;

  before(function(){
    return fs.readFile(target).then(function(result){
      body = result;
      obj = yaml.load(result);

      file = new box.File({
        source: target,
        path: target,
        type: 'create',
        params: {foo: 'bar'},
        content: new Buffer(body)
      });

      return hexo.init();
    });
  });

  it('read()', function(){
    return file.read().then(function(content){
      content.should.eql(body);
    });
  });

  it('read() - callback', function(callback){
    file.read(function(err, content){
      should.not.exist(err);
      content.should.eql(body);
      callback();
    });
  });

  it('read() - raw buffer', function(){
    file.read({encoding: null}).then(function(content){
      content.should.eql(new Buffer(body));
    });
  });

  it('read() - string encoding', function(){
    file.read('hex').then(function(content){
      content.should.eql(new Buffer(body).toString('hex'));
    });
  });

  it('read() - file was deleted', function(){
    var file = new box.File({source: 'foo'});

    file.read().catch(function(err){
      err.should.have.property('message', 'File "foo" was deleted.');
    });
  });

  it('readSync()', function(){
    file.readSync().should.eql(body);
  });

  it('readSync() - raw buffer', function(){
    file.readSync({encoding: null}).should.eql(new Buffer(body));
  });

  it('readSync() - string encoding', function(){
    file.readSync('hex').should.eql(new Buffer(body).toString('hex'));
  });

  it('readSync() - file was deleted', function(){
    var file = new box.File({source: 'foo'});

    try {
      file.readSync();
    } catch (err){
      err.should.have.property('message', 'File "foo" was deleted.');
    }
  });

  it('stat()', function(){
    return Promise.all([
      fs.stat(target),
      file.stat()
    ]).then(function(stats){
      stats[0].should.eql(stats[1]);
    });
  });

  it('stat() - callback', function(callback){
    file.stat(function(err, stats){
      should.not.exist(err);

      fs.stat(target, function(err, realStats){
        stats.should.eql(realStats);
        callback();
      });
    });
  });

  it('statSync()', function(){
    return fs.stat(target).then(function(stats){
      file.statSync().should.eql(stats);
    });
  });

  it('render()', function(){
    return file.render().then(function(data){
      data.should.eql(obj);
    });
  });

  it('render() - callback', function(callback){
    file.render(function(err, data){
      should.not.exist(err);
      data.should.eql(obj);
      callback();
    });
  });

  it('renderSync()', function(){
    file.renderSync().should.eql(obj);
  });
});
var should = require('chai').should();
var fs = require('hexo-fs');
var pathFn = require('path');

describe('deploy', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'deploy_test'), {silent: true});
  var deploy = require('../../../lib/plugins/console/deploy').bind(hexo);

  before(function(){
    return fs.mkdirs(hexo.public_dir).then(function(){
      return hexo.init();
    });
  });

  after(function(){
    return fs.rmdir(hexo.base_dir);
  });

  it('single deploy setting', function(){
    var executed = 0;
    var emitted = 0;

    hexo.config.deploy = {
      type: 'foo',
      foo: 'bar'
    };

    hexo.extend.deployer.register('foo', function(args){
      args.should.eql({
        type: 'foo',
        foo: 'foo',
        bar: 'bar'
      });

      executed++;
    });

    hexo.once('deployBefore', function(){
      emitted++;
    });

    hexo.once('deployAfter', function(){
      emitted++;
    });

    return deploy({foo: 'foo', bar: 'bar'}).then(function(){
      executed.should.eql(1);
      emitted.should.eql(2);
    });
  });

  it('multiple deploy setting', function(){
    var executed = 0;

    hexo.config.deploy = [
      {type: 'foo'},
      {type: 'bar'}
    ];

    hexo.extend.deployer.register('foo', function(args){
      executed++;
    });

    hexo.extend.deployer.register('bar', function(args){
      executed++;
    });

    return deploy({}).then(function(){
      executed.should.eql(2);
    });
  });

  it('deployer not found');

  it('generate', function(){
    return fs.writeFile(pathFn.join(hexo.source_dir, 'test.txt'), 'test').then(function(){
      return deploy({generate: true});
    }).then(function(){
      return fs.readFile(pathFn.join(hexo.public_dir, 'test.txt'));
    }).then(function(content){
      content.should.eql('test');
      return fs.rmdir(hexo.source_dir);
    });
  });

  it('run generate if public directory not exist', function(){
    return fs.rmdir(hexo.public_dir).then(function(){
      return deploy({});
    }).then(function(){
      return fs.exists(hexo.public_dir);
    }).then(function(exist){
      exist.should.be.true;
    });
  });
});
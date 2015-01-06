var should = require('chai').should();
var fs = require('hexo-fs');
var pathFn = require('path');

describe('deploy', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'deploy_test'), {silent: true});
  var deploy = require('../../../lib/plugins/console/deploy').bind(hexo);

  before(function(){
    return fs.mkdirs(hexo.public_dir);
  });

  after(function(){
    return fs.rmdir(hexo.base_dir);
  });

  it('single deploy setting', function(){
    var executed = 0;

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

    return deploy({foo: 'foo', bar: 'bar'}).then(function(){
      executed.should.eql(1);
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

  it('-g/--generate argument');

  it('run generate if public directory not exist');

  it('deployBefore & deployAfter events');
});
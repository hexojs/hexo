'use strict';

var should = require('chai').should();
var fs = require('hexo-fs');
var pathFn = require('path');
var sinon = require('sinon');

describe('deploy', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'deploy_test'), {silent: true});
  var deploy = require('../../../lib/plugins/console/deploy').bind(hexo);

  before(function(){
    return fs.mkdirs(hexo.public_dir).then(function(){
      return hexo.init();
    });
  });

  beforeEach(function(){
    hexo.config.deploy = {type: 'foo'};
    hexo.extend.deployer.register('foo', function(){});
  });

  after(function(){
    return fs.rmdir(hexo.base_dir);
  });

  it('single deploy setting', function(){
    hexo.config.deploy = {
      type: 'foo',
      foo: 'bar'
    };

    var deployer = sinon.spy(function(args){
      args.should.eql({
        type: 'foo',
        foo: 'foo',
        bar: 'bar'
      });
    });

    var beforeListener = sinon.spy();
    var afterListener = sinon.spy();

    hexo.once('deployBefore', beforeListener);
    hexo.once('deployAfter', afterListener);
    hexo.extend.deployer.register('foo', deployer);

    return deploy({foo: 'foo', bar: 'bar'}).then(function(){
      deployer.calledOnce.should.be.true;
      beforeListener.calledOnce.should.be.true;
      afterListener.calledOnce.should.be.true;
    });
  });

  it('multiple deploy setting', function(){
    var deployer1 = sinon.spy(function(args){
      args.should.eql({
        type: 'foo',
        foo: 'foo',
        test: true
      });
    });

    var deployer2 = sinon.spy(function(args){
      args.should.eql({
        type: 'bar',
        bar: 'bar',
        test: true
      });
    });

    hexo.config.deploy = [
      {type: 'foo', foo: 'foo'},
      {type: 'bar', bar: 'bar'}
    ];

    hexo.extend.deployer.register('foo', deployer1);
    hexo.extend.deployer.register('bar', deployer2);

    return deploy({test: true}).then(function(){
      deployer1.calledOnce.should.be.true;
      deployer2.calledOnce.should.be.true;
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
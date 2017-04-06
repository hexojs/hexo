var should = require('chai').should(); // eslint-disable-line
var fs = require('hexo-fs');
var pathFn = require('path');
var sinon = require('sinon');

describe('deploy', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'deploy_test'), {silent: true});
  var deploy = require('../../../lib/plugins/console/deploy').bind(hexo);

  before(() => fs.mkdirs(hexo.public_dir).then(() => hexo.init()));

  beforeEach(() => {
    hexo.config.deploy = {type: 'foo'};
    hexo.extend.deployer.register('foo', () => {});
  });

  after(() => fs.rmdir(hexo.base_dir));

  it('single deploy setting', () => {
    hexo.config.deploy = {
      type: 'foo',
      foo: 'bar'
    };

    var deployer = sinon.spy(args => {
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

    return deploy({foo: 'foo', bar: 'bar'}).then(() => {
      deployer.calledOnce.should.be.true;
      beforeListener.calledOnce.should.be.true;
      afterListener.calledOnce.should.be.true;
    });
  });

  it('multiple deploy setting', () => {
    var deployer1 = sinon.spy(args => {
      args.should.eql({
        type: 'foo',
        foo: 'foo',
        test: true
      });
    });

    var deployer2 = sinon.spy(args => {
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

    return deploy({test: true}).then(() => {
      deployer1.calledOnce.should.be.true;
      deployer2.calledOnce.should.be.true;
    });
  });

  it('deployer not found');

  it('generate', () => fs.writeFile(pathFn.join(hexo.source_dir, 'test.txt'), 'test').then(() => deploy({generate: true})).then(() => fs.readFile(pathFn.join(hexo.public_dir, 'test.txt'))).then(content => {
    content.should.eql('test');
    return fs.rmdir(hexo.source_dir);
  }));

  it('run generate if public directory not exist', () => fs.rmdir(hexo.public_dir).then(() => deploy({})).then(() => fs.exists(hexo.public_dir)).then(exist => {
    exist.should.be.true;
  }));
});

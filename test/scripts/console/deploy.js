'use strict';

const { exists, mkdirs, readFile, rmdir, writeFile } = require('hexo-fs');
const { join } = require('path');
const { spy } = require('sinon');

describe('deploy', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(join(__dirname, 'deploy_test'), { silent: true });
  const deploy = require('../../../lib/plugins/console/deploy').bind(hexo);

  before(async () => {
    await mkdirs(hexo.public_dir);
    hexo.init();
  });

  beforeEach(() => {
    hexo.config.deploy = { type: 'foo' };
    hexo.extend.deployer.register('foo', () => {});
  });

  after(() => rmdir(hexo.base_dir));

  it('no deploy config', () => {
    delete hexo.config.deploy;

    should.not.exist(deploy({ test: true }));
  });

  it('single deploy setting', async () => {
    hexo.config.deploy = {
      type: 'foo',
      foo: 'bar'
    };

    const deployer = spy(args => {
      args.should.eql({
        type: 'foo',
        foo: 'foo',
        bar: 'bar'
      });
    });

    const beforeListener = spy();
    const afterListener = spy();

    hexo.once('deployBefore', beforeListener);
    hexo.once('deployAfter', afterListener);
    hexo.extend.deployer.register('foo', deployer);

    await deploy({ foo: 'foo', bar: 'bar' });
    deployer.calledOnce.should.eql(true);
    beforeListener.calledOnce.should.eql(true);
    afterListener.calledOnce.should.eql(true);
  });

  it('multiple deploy setting', async () => {
    const deployer1 = spy(args => {
      args.should.eql({
        type: 'foo',
        foo: 'foo',
        test: true
      });
    });

    const deployer2 = spy(args => {
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

    await deploy({ test: true });
    deployer1.calledOnce.should.eql(true);
    deployer2.calledOnce.should.eql(true);
  });

  // it('deployer not found'); missing-unit-test

  it('generate', async () => {
    await writeFile(join(hexo.source_dir, 'test.txt'), 'test');
    await deploy({ generate: true });
    const content = await readFile(join(hexo.public_dir, 'test.txt'));

    content.should.eql('test');

    await rmdir(hexo.source_dir);
  });

  it('run generate if public directory not exist', async () => {
    await rmdir(hexo.public_dir);
    await deploy({});
    const exist = await exists(hexo.public_dir);

    exist.should.eql(true);
  });
});

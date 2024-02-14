'use strict';

const { spy, assert: sinonAssert, stub } = require('sinon');

describe('migrate', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo(__dirname, { silent: true });
  const migrate = require('../../../dist/plugins/console/migrate').bind(hexo);

  it('default', async () => {
    const migrator = spy();

    hexo.extend.migrator.register('test', migrator);

    await migrate({ _: ['test'], foo: 1, bar: 2 });

    sinonAssert.calledWithMatch(migrator, { foo: 1, bar: 2 });
    migrator.calledOnce.should.be.true;
  });

  it('no args', async () => {
    const hexo = new Hexo(__dirname, { silent: true });
    hexo.call = spy();
    const migrate = require('../../../dist/plugins/console/migrate').bind(hexo);

    await migrate({ _: [] });
    hexo.call.calledOnce.should.be.true;
    hexo.call.args[0][0].should.eql('help');
    hexo.call.args[0][1]._[0].should.eql('migrate');
  });

  it('migrator not found', async () => {
    const logStub = stub(console, 'log');

    await migrate({ _: ['foo'] });

    logStub.calledOnce.should.be.true;
    logStub.args[0][0].should.contains('migrator plugin is not installed.');
    logStub.args[0][0].should.contains('Installed migrator plugins:');

    logStub.restore();
  });
});

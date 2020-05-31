'use strict';

const { spy, assert: sinonAssert } = require('sinon');

describe('migrate', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(__dirname, {silent: true});
  const migrate = require('../../../lib/plugins/console/migrate').bind(hexo);

  it('default', async () => {
    const migrator = spy();

    hexo.extend.migrator.register('test', migrator);

    await migrate({_: ['test'], foo: 1, bar: 2});

    sinonAssert.calledWithMatch(migrator, { foo: 1, bar: 2 });
    migrator.calledOnce.should.be.true;
  });
});

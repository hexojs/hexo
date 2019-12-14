'use strict';

const { spy } = require('sinon');

describe('migrate', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(__dirname, {silent: true});
  const migrate = require('../../../lib/plugins/console/migrate').bind(hexo);

  it('default', async() => {
    const migrator = spy(args => {
      args.foo.should.eql(1);
      args.bar.should.eql(2);
    });

    hexo.extend.migrator.register('test', migrator);

    await migrate({_: ['test'], foo: 1, bar: 2});
    migrator.calledOnce.should.eql(true);
  });
});

'use strict';

const sinon = require('sinon');

describe('migrate', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(__dirname, {silent: true});
  const migrate = require('../../../lib/plugins/console/migrate').bind(hexo);

  it('default', () => {
    const migrator = sinon.spy(args => {
      args.foo.should.eql(1);
      args.bar.should.eql(2);
    });

    hexo.extend.migrator.register('test', migrator);

    return migrate({_: ['test'], foo: 1, bar: 2}).then(() => {
      migrator.calledOnce.should.be.true;
    });
  });
});

var should = require('chai').should(); // eslint-disable-line
var sinon = require('sinon');

describe('migrate', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname, {silent: true});
  var migrate = require('../../../lib/plugins/console/migrate').bind(hexo);

  it('default', () => {
    var migrator = sinon.spy(args => {
      args.foo.should.eql(1);
      args.bar.should.eql(2);
    });

    hexo.extend.migrator.register('test', migrator);

    return migrate({_: ['test'], foo: 1, bar: 2}).then(() => {
      migrator.calledOnce.should.be.true;
    });
  });
});

'use strict';

const { spy } = require('sinon');

describe('Console list', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(__dirname);

  it('no args', () => {
    hexo.call = spy();

    const list = require('../../../lib/plugins/console/list').bind(hexo);

    list({ _: [''] });

    hexo.call.calledOnce.should.be.true;
    hexo.call.args[0][0].should.eql('help');
    hexo.call.args[0][1]._[0].should.eql('list');
  });

  it('list type not found', () => {
    hexo.call = spy();

    const list = require('../../../lib/plugins/console/list').bind(hexo);

    list({ _: ['test'] });

    hexo.call.calledOnce.should.be.true;
    hexo.call.args[0][0].should.eql('help');
    hexo.call.args[0][1]._[0].should.eql('list');
  });
});

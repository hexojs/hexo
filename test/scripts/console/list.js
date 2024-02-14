'use strict';

const { spy, stub, assert: sinonAssert } = require('sinon');
const Promise = require('bluebird');

describe('Console list', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo(__dirname);

  it('no args', () => {
    hexo.call = spy();

    const list = require('../../../dist/plugins/console/list').bind(hexo);

    list({ _: [''] });

    hexo.call.calledOnce.should.be.true;
    hexo.call.args[0][0].should.eql('help');
    hexo.call.args[0][1]._[0].should.eql('list');
  });

  it('has args', async () => {
    const logStub = stub(console, 'log');

    hexo.load = () => Promise.resolve();

    const list = require('../../../dist/plugins/console/list').bind(hexo);

    await list({ _: ['page'] });

    sinonAssert.calledWithMatch(logStub, 'Date');
    sinonAssert.calledWithMatch(logStub, 'Title');
    sinonAssert.calledWithMatch(logStub, 'Path');
    sinonAssert.calledWithMatch(logStub, 'No pages.');
    logStub.restore();
  });

  it('list type not found', () => {
    hexo.call = spy();

    const list = require('../../../dist/plugins/console/list').bind(hexo);

    list({ _: ['test'] });

    hexo.call.calledOnce.should.be.true;
    hexo.call.args[0][0].should.eql('help');
    hexo.call.args[0][1]._[0].should.eql('list');
  });
});

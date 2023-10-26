'use strict';

const { stub, assert: sinonAssert } = require('sinon');

describe('Console list', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo();
  const Page = hexo.model('Page');
  const listPages = require('../../../dist/plugins/console/list/page').bind(hexo);

  hexo.config.permalink = ':title/';

  let logStub;

  before(() => { logStub = stub(console, 'log'); });

  afterEach(() => { logStub.reset(); });

  after(() => { logStub.restore(); });

  it('no page', () => {
    listPages();
    sinonAssert.calledWithMatch(logStub, 'Date');
    sinonAssert.calledWithMatch(logStub, 'Title');
    sinonAssert.calledWithMatch(logStub, 'Path');
    sinonAssert.calledWithMatch(logStub, 'No pages.');
  });

  it('page', async () => {
    await Page.insert({
      source: 'foo',
      title: 'Hello World',
      path: 'bar'
    });
    listPages();
    sinonAssert.calledWithMatch(logStub, 'Date');
    sinonAssert.calledWithMatch(logStub, 'Title');
    sinonAssert.calledWithMatch(logStub, 'Path');
    sinonAssert.calledWithMatch(logStub, 'Hello World');
    sinonAssert.calledWithMatch(logStub, 'foo');
  });

  it('page with unicode', async () => {
    await Page.insert({
      source: 'foo',
      title: '\u0100',
      path: 'bar'
    });
    listPages();
    sinonAssert.calledWithMatch(logStub, 'Date');
    sinonAssert.calledWithMatch(logStub, 'Title');
    sinonAssert.calledWithMatch(logStub, 'Path');
    sinonAssert.calledWithMatch(logStub, '\u0100');
    sinonAssert.calledWithMatch(logStub, 'foo');
  });
});

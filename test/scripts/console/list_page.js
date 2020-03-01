'use strict';

const { stub, assert: sinonAssert } = require('sinon');

describe('Console list', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo();
  const Page = hexo.model('Page');
  const listPages = require('../../../lib/plugins/console/list/page').bind(hexo);

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

  it('page', () => {
    return Page.insert({
      source: 'foo',
      title: 'Hello World',
      path: 'bar'
    }).then(() => {
      listPages();
      sinonAssert.calledWithMatch(logStub, 'Date');
      sinonAssert.calledWithMatch(logStub, 'Title');
      sinonAssert.calledWithMatch(logStub, 'Path');
      sinonAssert.calledWithMatch(logStub, 'Hello World');
      sinonAssert.calledWithMatch(logStub, 'foo');
    });
  });
});

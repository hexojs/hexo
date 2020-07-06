'use strict';

const { stub } = require('sinon');

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
    logStub.calledWithMatch('Date').should.be.true;
    logStub.calledWithMatch('Title').should.be.true;
    logStub.calledWithMatch('Path').should.be.true;
    logStub.calledWithMatch('No pages.').should.be.true;
  });

  it('page', async () => {
    await Page.insert({
      source: 'foo',
      title: 'Hello World',
      path: 'bar'
    });
    listPages();
    logStub.calledWithMatch('Date').should.be.true;
    logStub.calledWithMatch('Title').should.be.true;
    logStub.calledWithMatch('Path').should.be.true;
    logStub.calledWithMatch('Hello World').should.be.true;
    logStub.calledWithMatch('foo').should.be.true;
  });
});

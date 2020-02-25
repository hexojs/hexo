'use strict';

const { stub, match } = require('sinon');
const { expect } = require('chai');

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
    expect(logStub.calledWith(match('Date'))).be.true;
    expect(logStub.calledWith(match('Title'))).be.true;
    expect(logStub.calledWith(match('Path'))).be.true;
    expect(logStub.calledWith(match('No pages.'))).be.true;
  });

  it('page', () => {
    return Page.insert({
      source: 'foo',
      title: 'Hello World',
      path: 'bar'
    }).then(() => {
      listPages();
      expect(logStub.calledWith(match('Date'))).be.true;
      expect(logStub.calledWith(match('Title'))).be.true;
      expect(logStub.calledWith(match('Path'))).be.true;
      expect(logStub.calledWith(match('Hello World'))).be.true;
      expect(logStub.calledWith(match('foo'))).be.true;
    });
  });
});

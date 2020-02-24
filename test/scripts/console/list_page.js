'use strict';

const sinon = require('sinon');
const expect = require('chai').expect;

describe('Console list', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo();
  const Page = hexo.model('Page');
  const listPages = require('../../../lib/plugins/console/list/page').bind(hexo);

  hexo.config.permalink = ':title/';
  before(() => {
    const log = console.log;
    sinon.stub(console, 'log').callsFake((...args) => {
      return log.apply(log, args);
    });
  });

  after(() => {
    console.log.restore();
  });

  it('no page', () => {
    listPages();
    expect(console.log.calledWith(sinon.match('Date'))).be.true;
    expect(console.log.calledWith(sinon.match('Title'))).be.true;
    expect(console.log.calledWith(sinon.match('Path'))).be.true;
    expect(console.log.calledWith(sinon.match('No pages.'))).be.true;
  });

  it('page', () => Page.insert({
    source: 'foo',
    title: 'Hello World',
    path: 'bar'
  })
    .then(() => {
      listPages();
      expect(console.log.calledWith(sinon.match('Date'))).be.true;
      expect(console.log.calledWith(sinon.match('Title'))).be.true;
      expect(console.log.calledWith(sinon.match('Path'))).be.true;
      expect(console.log.calledWith(sinon.match('Hello World'))).be.true;
      expect(console.log.calledWith(sinon.match('foo'))).be.true;
    }));
});

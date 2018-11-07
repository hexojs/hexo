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
    sinon.stub(console, 'log').callsFake(function(...args) {
      return log.apply(log, args);
    });
  });

  after(() => {
    console.log.restore();
  });

  it('no page', () => {
    listPages();
    expect(console.log.calledWith(sinon.match('Date'))).to.be.true;
    expect(console.log.calledWith(sinon.match('Title'))).to.be.true;
    expect(console.log.calledWith(sinon.match('Path'))).to.be.true;
    expect(console.log.calledWith(sinon.match('No pages.'))).to.be.true;
  });

  it('page', () => Page.insert({
    source: 'foo',
    title: 'Hello World',
    path: 'bar'
  })
    .then(() => {
      listPages();
      expect(console.log.calledWith(sinon.match('Date'))).to.be.true;
      expect(console.log.calledWith(sinon.match('Title'))).to.be.true;
      expect(console.log.calledWith(sinon.match('Path'))).to.be.true;
      expect(console.log.calledWith(sinon.match('Hello World'))).to.be.true;
      expect(console.log.calledWith(sinon.match('foo'))).to.be.true;
    }));
});

'use strict';

var sinon = require('sinon');
var expect = require('chai').expect;

describe('Console list', function() {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var Page = hexo.model('Page');
  var listPages = require('../../../lib/plugins/console/list/page').bind(hexo);

  hexo.config.permalink = ':title/';
  before(function() {
    var log = console.log;
    sinon.stub(console, 'log', function() {
      return log.apply(log, arguments);
    });
  });
  after(function() {
    console.log.restore();
  });
  it('no page', function() {
    listPages()
    expect( console.log.calledWith(sinon.match('Date')) ).to.be.true;
    expect( console.log.calledWith(sinon.match('Title')) ).to.be.true;
    expect( console.log.calledWith(sinon.match('Path')) ).to.be.true;
    expect( console.log.calledWith(sinon.match('No pages.')) ).to.be.true;
  });
  it('page', function() {
    return Page.insert({
      source: 'foo',
      title: 'Hello World',
      path: 'bar'
    })
    .then(function(){
      listPages()
      expect( console.log.calledWith(sinon.match('Date')) ).to.be.true;
      expect( console.log.calledWith(sinon.match('Title')) ).to.be.true;
      expect( console.log.calledWith(sinon.match('Path')) ).to.be.true;
      expect( console.log.calledWith(sinon.match('Hello World')) ).to.be.true;
      expect( console.log.calledWith(sinon.match('foo')) ).to.be.true;
    })
  });
});

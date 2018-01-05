'use strict';

var Promise = require('bluebird');
var sinon = require('sinon');
var expect = require('chai').expect;

describe('Console list', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);
  var Post = hexo.model('Post');

  var listCategories = require('../../../lib/plugins/console/list/category').bind(hexo);

  before(() => {
    var log = console.log;
    sinon.stub(console, 'log').callsFake(function(...args) {
      return log.apply(log, args);
    });
  });

  after(() => {
    console.log.restore();
  });

  it('no categories', () => {
    listCategories();
    expect(console.log.calledWith(sinon.match('Name'))).to.be.true;
    expect(console.log.calledWith(sinon.match('Posts'))).to.be.true;
    expect(console.log.calledWith(sinon.match('No categories.'))).to.be.true;
  });

  it('categories', () => {
    var posts = [
      {source: 'foo', slug: 'foo', title: 'Its', date: 1e8},
      {source: 'bar', slug: 'bar', title: 'Math', date: 1e8 + 1},
      {source: 'baz', slug: 'baz', title: 'Dude', date: 1e8 - 1}
    ];
    return hexo.init()
      .then(() => Post.insert(posts)).then(posts => Promise.each([
        ['foo'],
        ['baz'],
        ['baz']
      ], (tags, i) => posts[i].setCategories(tags))).then(() => {
        hexo.locals.invalidate();
      })
      .then(() => {
        listCategories();
        expect(console.log.calledWith(sinon.match('Name'))).to.be.true;
        expect(console.log.calledWith(sinon.match('Posts'))).to.be.true;
        expect(console.log.calledWith(sinon.match('baz'))).to.be.true;
        expect(console.log.calledWith(sinon.match('foo'))).to.be.true;
      });
  });
});

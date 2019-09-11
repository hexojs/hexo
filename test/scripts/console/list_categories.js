'use strict';

const Promise = require('bluebird');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('Console list', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(__dirname);
  const Post = hexo.model('Post');

  const listCategories = require('../../../lib/plugins/console/list/category').bind(
    hexo
  );

  before(() => {
    const log = console.log;
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
    const posts = [
      { source: 'foo', slug: 'foo', title: 'Its', date: 1e8 },
      { source: 'bar', slug: 'bar', title: 'Math', date: 1e8 + 1 },
      { source: 'baz', slug: 'baz', title: 'Dude', date: 1e8 - 1 }
    ];
    return hexo
      .init()
      .then(() => Post.insert(posts))
      .then(posts =>
        Promise.each([['foo'], ['baz'], ['baz']], (tags, i) =>
          posts[i].setCategories(tags)
        )
      )
      .then(() => {
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

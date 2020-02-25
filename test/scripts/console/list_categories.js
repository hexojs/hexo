'use strict';

const Promise = require('bluebird');
const { stub, match } = require('sinon');
const { expect } = require('chai');

describe('Console list', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(__dirname);
  const Post = hexo.model('Post');

  const listCategories = require('../../../lib/plugins/console/list/category').bind(hexo);

  let logStub;

  before(() => { logStub = stub(console, 'log'); });

  afterEach(() => { logStub.reset(); });

  after(() => { logStub.restore(); });

  it('no categories', () => {
    listCategories();
    expect(logStub.calledWith(match('Name'))).be.true;
    expect(logStub.calledWith(match('Posts'))).be.true;
    expect(logStub.calledWith(match('No categories.'))).be.true;
  });

  it('categories', () => {
    const posts = [
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
      }).then(() => {
        listCategories();
        expect(logStub.calledWith(match('Name'))).be.true;
        expect(logStub.calledWith(match('Posts'))).be.true;
        expect(logStub.calledWith(match('baz'))).be.true;
        expect(logStub.calledWith(match('foo'))).be.true;
      });
  });
});

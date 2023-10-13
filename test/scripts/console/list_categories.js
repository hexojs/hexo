'use strict';

const Promise = require('bluebird');
const { stub, assert: sinonAssert } = require('sinon');

describe('Console list', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo(__dirname);
  const Post = hexo.model('Post');

  const listCategories = require('../../../dist/plugins/console/list/category').bind(hexo);

  let logStub;

  before(() => { logStub = stub(console, 'log'); });

  afterEach(() => { logStub.reset(); });

  after(() => { logStub.restore(); });

  it('no categories', () => {
    listCategories();
    sinonAssert.calledWithMatch(logStub, 'Name');
    sinonAssert.calledWithMatch(logStub, 'Posts');
    sinonAssert.calledWithMatch(logStub, 'No categories.');
  });

  it('categories', async () => {
    const posts = [
      {source: 'foo', slug: 'foo', title: 'Its', date: 1e8},
      {source: 'bar', slug: 'bar', title: 'Math', date: 1e8 + 1},
      {source: 'baz', slug: 'baz', title: 'Dude', date: 1e8 - 1}
    ];

    await hexo.init();
    const output = await Post.insert(posts);
    await Promise.each([
      ['foo'],
      ['baz'],
      ['baz']
    ], (tags, i) => output[i].setCategories(tags));
    await hexo.locals.invalidate();
    listCategories();
    sinonAssert.calledWithMatch(logStub, 'Name');
    sinonAssert.calledWithMatch(logStub, 'Posts');
    sinonAssert.calledWithMatch(logStub, 'baz');
    sinonAssert.calledWithMatch(logStub, 'foo');
  });
});

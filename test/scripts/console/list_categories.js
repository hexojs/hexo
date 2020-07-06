'use strict';

const Promise = require('bluebird');
const { stub } = require('sinon');

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
    logStub.calledWithMatch('Name').should.be.true;
    logStub.calledWithMatch('Posts').should.be.true;
    logStub.calledWithMatch('No categories.').should.be.true;
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
    logStub.calledWithMatch('Name').should.be.true;
    logStub.calledWithMatch('Posts').should.be.true;
    logStub.calledWithMatch('baz').should.be.true;
    logStub.calledWithMatch('foo').should.be.true;
  });
});

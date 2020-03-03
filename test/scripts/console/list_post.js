'use strict';

const { stub, match } = require('sinon');
const { expect } = require('chai');

describe('Console list', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(__dirname);
  const Post = hexo.model('Post');

  const listPosts = require('../../../lib/plugins/console/list/post').bind(hexo);

  let logStub;

  before(() => { logStub = stub(console, 'log'); });

  afterEach(() => { logStub.reset(); });

  after(() => { logStub.restore(); });

  it('no post', () => {
    listPosts();
    expect(logStub.calledWith(match('Date'))).be.true;
    expect(logStub.calledWith(match('Title'))).be.true;
    expect(logStub.calledWith(match('Path'))).be.true;
    expect(logStub.calledWith(match('Category'))).be.true;
    expect(logStub.calledWith(match('Tags'))).be.true;
    expect(logStub.calledWith(match('No posts.'))).be.true;
  });

  it('post', async () => {
    const posts = [
      {source: 'foo', slug: 'foo', title: 'Its', date: 1e8},
      {source: 'bar', slug: 'bar', title: 'Math', date: 1e8 + 1},
      {source: 'baz', slug: 'baz', title: 'Dude', date: 1e8 - 1}
    ];

    await hexo.init();
    await Post.insert(posts);
    await hexo.locals.invalidate();

    listPosts();
    expect(logStub.calledWith(match('Date'))).be.true;
    expect(logStub.calledWith(match('Title'))).be.true;
    expect(logStub.calledWith(match('Path'))).be.true;
    expect(logStub.calledWith(match('Category'))).be.true;
    expect(logStub.calledWith(match('Tags'))).be.true;
    for (let i = 0; i < posts.length; i++) {
      expect(logStub.calledWith(match(posts[i].source))).be.true;
      expect(logStub.calledWith(match(posts[i].slug))).be.true;
      expect(logStub.calledWith(match(posts[i].title))).be.true;
    }
  });
});

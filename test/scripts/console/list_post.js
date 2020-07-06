'use strict';

const { stub } = require('sinon');

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
    logStub.calledWithMatch('Date').should.be.true;
    logStub.calledWithMatch('Title').should.be.true;
    logStub.calledWithMatch('Path').should.be.true;
    logStub.calledWithMatch('Category').should.be.true;
    logStub.calledWithMatch('Tags').should.be.true;
    logStub.calledWithMatch('No posts.').should.be.true;
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
    logStub.calledWithMatch('Date').should.be.true;
    logStub.calledWithMatch('Title').should.be.true;
    logStub.calledWithMatch('Path').should.be.true;
    logStub.calledWithMatch('Category').should.be.true;
    logStub.calledWithMatch('Tags').should.be.true;
    posts.forEach(post => {
      logStub.calledWithMatch(post.source).should.be.true;
      logStub.calledWithMatch(post.source).should.be.true;
      logStub.calledWithMatch(post.slug).should.be.true;
      logStub.calledWithMatch(post.title).should.be.true;
    });
  });
});

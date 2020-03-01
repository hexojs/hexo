'use strict';

const { stub, assert: sinonAssert } = require('sinon');

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
    sinonAssert.calledWithMatch(logStub, 'Date');
    sinonAssert.calledWithMatch(logStub, 'Title');
    sinonAssert.calledWithMatch(logStub, 'Path');
    sinonAssert.calledWithMatch(logStub, 'Category');
    sinonAssert.calledWithMatch(logStub, 'Tags');
    sinonAssert.calledWithMatch(logStub, 'No posts.');
  });

  it('post', () => {
    const posts = [
      {source: 'foo', slug: 'foo', title: 'Its', date: 1e8},
      {source: 'bar', slug: 'bar', title: 'Math', date: 1e8 + 1},
      {source: 'baz', slug: 'baz', title: 'Dude', date: 1e8 - 1}
    ];
    return hexo.init()
      .then(() => Post.insert(posts)).then(() => {
        hexo.locals.invalidate();
      })
      .then(() => {
        listPosts();
        sinonAssert.calledWithMatch(logStub, 'Date');
        sinonAssert.calledWithMatch(logStub, 'Title');
        sinonAssert.calledWithMatch(logStub, 'Path');
        sinonAssert.calledWithMatch(logStub, 'Category');
        sinonAssert.calledWithMatch(logStub, 'Tags');
        for (let i = 0; i < posts.length; i++) {
          sinonAssert.calledWithMatch(logStub, posts[i].source);
          sinonAssert.calledWithMatch(logStub, posts[i].slug);
          sinonAssert.calledWithMatch(logStub, posts[i].title);
        }
      });
  });
});

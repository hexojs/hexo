'use strict';

const sinon = require('sinon');
const expect = require('chai').expect;

describe('Console list', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(__dirname);
  const Post = hexo.model('Post');

  const listPosts = require('../../../lib/plugins/console/list/post').bind(hexo);

  before(() => {
    const log = console.log;
    sinon.stub(console, 'log').callsFake((...args) => {
      return log.apply(log, args);
    });
  });

  after(() => {
    console.log.restore();
  });

  it('no post', () => {
    listPosts();
    expect(console.log.calledWith(sinon.match('Date'))).be.true;
    expect(console.log.calledWith(sinon.match('Title'))).be.true;
    expect(console.log.calledWith(sinon.match('Path'))).be.true;
    expect(console.log.calledWith(sinon.match('Category'))).be.true;
    expect(console.log.calledWith(sinon.match('Tags'))).be.true;
    expect(console.log.calledWith(sinon.match('No posts.'))).be.true;
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
    expect(console.log.calledWith(sinon.match('Date'))).to.be.true;
    expect(console.log.calledWith(sinon.match('Title'))).to.be.true;
    expect(console.log.calledWith(sinon.match('Path'))).to.be.true;
    expect(console.log.calledWith(sinon.match('Category'))).to.be.true;
    expect(console.log.calledWith(sinon.match('Tags'))).to.be.true;
    for (let i = 0; i < posts.length; i++) {
      expect(console.log.calledWith(sinon.match(posts[i].source))).to.be.true;
      expect(console.log.calledWith(sinon.match(posts[i].slug))).to.be.true;
      expect(console.log.calledWith(sinon.match(posts[i].title))).to.be.true;
    }
  });
});

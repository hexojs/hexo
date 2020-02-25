'use strict';

const sinon = require('sinon');
const expect = require('chai').expect;

describe('Console list', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(__dirname);
  const Post = hexo.model('Post');

  const listPosts = require('../../../lib/plugins/console/list/post').bind(hexo);

  let stub;

  before(() => { stub = sinon.stub(console, 'log'); });

  afterEach(() => { stub.reset(); });

  after(() => { stub.restore(); });

  it('no post', () => {
    listPosts();
    expect(stub.calledWith(sinon.match('Date'))).be.true;
    expect(stub.calledWith(sinon.match('Title'))).be.true;
    expect(stub.calledWith(sinon.match('Path'))).be.true;
    expect(stub.calledWith(sinon.match('Category'))).be.true;
    expect(stub.calledWith(sinon.match('Tags'))).be.true;
    expect(stub.calledWith(sinon.match('No posts.'))).be.true;
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
        expect(stub.calledWith(sinon.match('Date'))).be.true;
        expect(stub.calledWith(sinon.match('Title'))).be.true;
        expect(stub.calledWith(sinon.match('Path'))).be.true;
        expect(stub.calledWith(sinon.match('Category'))).be.true;
        expect(stub.calledWith(sinon.match('Tags'))).be.true;
        for (let i = 0; i < posts.length; i++) {
          expect(stub.calledWith(sinon.match(posts[i].source))).be.true;
          expect(stub.calledWith(sinon.match(posts[i].slug))).be.true;
          expect(stub.calledWith(sinon.match(posts[i].title))).be.true;
        }
      });
  });
});

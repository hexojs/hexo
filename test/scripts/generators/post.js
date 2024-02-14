'use strict';

const Promise = require('bluebird');

describe('post', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo(__dirname, {silent: true});
  const Post = hexo.model('Post');
  const generator = Promise.method(require('../../../dist/plugins/generator/post').bind(hexo));

  hexo.config.permalink = ':title/';

  function locals() {
    hexo.locals.invalidate();
    return hexo.locals.toObject();
  }

  before(() => hexo.init());

  it('default layout', async () => {
    const post = await Post.insert({
      source: 'foo',
      slug: 'bar'
    });
    const data = await generator(locals());
    post.__post = true;

    data.should.eql([
      {
        path: 'bar/',
        layout: ['post', 'page', 'index'],
        data: post
      }
    ]);

    post.remove();
  });

  it('custom layout', async () => {
    const post = await Post.insert({
      source: 'foo',
      slug: 'bar',
      layout: 'photo'
    });
    const data = await generator(locals());
    data[0].layout.should.eql(['photo', 'post', 'page', 'index']);

    post.remove();
  });

  it('layout disabled', async () => {
    const post = await Post.insert({
      source: 'foo',
      slug: 'bar',
      layout: false
    });
    const data = await generator(locals());
    should.not.exist(data[0].layout);

    post.remove();
  });

  it('prev/next post', async () => {
    const posts = await Post.insert([
      {source: 'foo', slug: 'foo', date: 1e8},
      {source: 'bar', slug: 'bar', date: 1e8 + 1},
      {source: 'baz', slug: 'baz', date: 1e8 - 1}
    ]);
    const data = await generator(locals());
    should.not.exist(data[0].data.prev);
    data[0].data.next._id.should.eq(posts[0]._id);
    data[1].data.prev._id.should.eq(posts[1]._id);
    data[1].data.next._id.should.eq(posts[2]._id);
    data[2].data.prev._id.should.eq(posts[0]._id);
    should.not.exist(data[2].data.next);

    await Promise.all(posts.map(post => post.remove()));
  });
});

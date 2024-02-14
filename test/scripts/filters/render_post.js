'use strict';

const { content, expected } = require('../../fixtures/post_render');

describe('Render post', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo();
  const Post = hexo.model('Post');
  const Page = hexo.model('Page');
  const renderPost = require('../../../dist/plugins/filter/before_generate/render_post').bind(hexo);

  before(async () => {
    await hexo.init();
    await hexo.loadPlugin(require.resolve('hexo-renderer-marked'));
  });

  it('post', async () => {
    let post = await Post.insert({
      source: 'foo.md',
      slug: 'foo',
      _content: content
    });

    const id = post._id;
    await renderPost();

    post = Post.findById(id);
    post.content.trim().should.eql(expected);

    post.remove();
  });

  it('page', async () => {
    let page = await Page.insert({
      source: 'foo.md',
      path: 'foo.html',
      _content: content
    });

    const id = page._id;
    await renderPost();

    page = Page.findById(id);
    page.content.trim().should.eql(expected);

    page.remove();
  });

});

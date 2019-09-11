'use strict';

const fixture = require('../../fixtures/post_render');

describe('Render post', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo();
  const Post = hexo.model('Post');
  const Page = hexo.model('Page');
  const renderPost = require('../../../lib/plugins/filter/before_generate/render_post').bind(
    hexo
  );

  before(() =>
    hexo
      .init()
      .then(() => hexo.loadPlugin(require.resolve('hexo-renderer-marked')))
  );

  it('post', () => {
    let id;

    return Post.insert({
      source: 'foo.md',
      slug: 'foo',
      _content: fixture.content
    })
      .then(post => {
        id = post._id;
        return renderPost();
      })
      .then(() => {
        const post = Post.findById(id);
        post.content.trim().should.eql(fixture.expected);

        return post.remove();
      });
  });

  it('page', () => {
    let id;

    return Page.insert({
      source: 'foo.md',
      path: 'foo.html',
      _content: fixture.content
    })
      .then(page => {
        id = page._id;
        return renderPost();
      })
      .then(() => {
        const page = Page.findById(id);
        page.content.trim().should.eql(fixture.expected);

        return page.remove();
      });
  });

  it('use data variables', () => {
    let id;

    return Page.insert({
      source: 'foo.md',
      path: 'foo.html',
      _content: '<p>Hello {{site.data.foo.name}}</p>'
    })
      .then(page => {
        id = page._id;
        return renderPost({ foo: { name: 'Hexo' } });
      })
      .then(() => {
        const page = Page.findById(id);
        page.content.trim().should.eql('<p>Hello Hexo</p>');

        return page.remove();
      });
  });
});

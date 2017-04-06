var should = require('chai').should(); // eslint-disable-line
var fixture = require('../../fixtures/post_render');

describe('Render post', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var Post = hexo.model('Post');
  var Page = hexo.model('Page');
  var renderPost = require('../../../lib/plugins/filter/before_generate/render_post').bind(hexo);

  before(() => hexo.init().then(() => hexo.loadPlugin(require.resolve('hexo-renderer-marked'))));

  it('post', () => {
    var id;

    return Post.insert({
      source: 'foo.md',
      slug: 'foo',
      _content: fixture.content
    }).then(post => {
      id = post._id;
      return renderPost();
    }).then(() => {
      var post = Post.findById(id);
      post.content.trim().should.eql(fixture.expected);

      return post.remove();
    });
  });

  it('page', () => {
    var id;

    return Page.insert({
      source: 'foo.md',
      path: 'foo.html',
      _content: fixture.content
    }).then(page => {
      id = page._id;
      return renderPost();
    }).then(() => {
      var page = Page.findById(id);
      page.content.trim().should.eql(fixture.expected);

      return page.remove();
    });
  });

  it('use data variables', () => {
    var id;

    return Page.insert({
      source: 'foo.md',
      path: 'foo.html',
      _content: '<p>Hello {{site.data.foo.name}}</p>'
    }).then(page => {
      id = page._id;
      return renderPost({foo: {name: 'Hexo'}});
    }).then(() => {
      var page = Page.findById(id);
      page.content.trim().should.eql('<p>Hello Hexo</p>');

      return page.remove();
    });
  });

});

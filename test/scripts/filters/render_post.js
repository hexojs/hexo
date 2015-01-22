var should = require('chai').should();
var fixture = require('../../fixtures/post_render');

describe('Render post', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var Post = hexo.model('Post');
  var Page = hexo.model('Page');
  var renderPost = require('../../../lib/plugins/filter/before_generate/render_post').bind(hexo);

  before(function(){
    return hexo.init().then(function(){
      return hexo.loadPlugin(require.resolve('hexo-renderer-marked'));
    });
  });

  it('post', function(){
    var id;

    return Post.insert({
      source: 'foo.md',
      slug: 'foo',
      _content: fixture.content
    }).then(function(post){
      id = post._id;
      return renderPost();
    }).then(function(){
      var post = Post.findById(id);
      post.content.should.eql(fixture.expected);

      return post.remove();
    });
  });

  it('page', function(){
    var id;

    return Page.insert({
      source: 'foo.md',
      path: 'foo.html',
      _content: fixture.content
    }).then(function(page){
      id = page._id;
      return renderPost();
    }).then(function(){
      var page = Page.findById(id);
      page.content.should.eql(fixture.expected);

      return page.remove();
    });
  });
});
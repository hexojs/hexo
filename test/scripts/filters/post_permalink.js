var should = require('chai').should();
var moment = require('moment');

var PERMALINK = ':year/:month/:day/:title/';

describe('post_permalink', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var postPermalink = require('../../../lib/plugins/filter/post_permalink').bind(hexo);
  var Post = hexo.model('Post');
  var post;

  hexo.config.permalink = PERMALINK;

  before(function(){
    var id;

    return hexo.init().then(function(){
      return Post.insert({
        source: 'foo.md',
        slug: 'foo',
        date: moment('2014-01-02')
      });
    }).then(function(post){
      id = post._id;
      return post.setCategories(['foo', 'bar']);
    }).then(function(){
      post = Post.findById(id);
    });
  });

  it('default', function(){
    postPermalink(post).should.eql('2014/01/02/foo/');
  });

  it('categories', function(){
    hexo.config.permalink = ':category/:title/';
    postPermalink(post).should.eql('foo/bar/foo/');
    hexo.config.permalink = PERMALINK;
  });

  it('uncategorized', function(){
    hexo.config.permalink = ':category/:title/';

    return Post.insert({
      source: 'bar.md',
      slug: 'bar'
    }).then(function(post){
      postPermalink(post).should.eql(hexo.config.default_category + '/bar/');
      hexo.config.permalink = PERMALINK;
      return Post.removeById(post._id);
    });
  });

  it('extra data', function(){
    hexo.config.permalink = ':layout/:title/';
    postPermalink(post).should.eql(post.layout + '/foo/');
    hexo.config.permalink = PERMALINK;
  });

  it('id', function(){
    hexo.config.permalink = ':id';

    postPermalink(post).should.eql(post._id);

    post.id = 1;
    postPermalink(post).should.eql('1');

    hexo.config.permalink = PERMALINK;
  });
});
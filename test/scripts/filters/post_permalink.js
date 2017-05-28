var should = require('chai').should(); // eslint-disable-line
var moment = require('moment');

var PERMALINK = ':year/:month/:day/:title/';

describe('post_permalink', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var postPermalink = require('../../../lib/plugins/filter/post_permalink').bind(hexo);
  var Post = hexo.model('Post');
  var post;

  hexo.config.permalink = PERMALINK;

  before(() => {
    var id;

    return hexo.init().then(() => Post.insert({
      source: 'foo.md',
      slug: 'foo',
      date: moment('2014-01-02')
    })).then(post => {
      id = post._id;
      return post.setCategories(['foo', 'bar']);
    }).then(() => {
      post = Post.findById(id);
    });
  });

  it('default', () => {
    postPermalink(post).should.eql('2014/01/02/foo/');
  });

  it('categories', () => {
    hexo.config.permalink = ':category/:title/';
    postPermalink(post).should.eql('foo/bar/foo/');
    hexo.config.permalink = PERMALINK;
  });

  it('uncategorized', () => {
    hexo.config.permalink = ':category/:title/';

    return Post.insert({
      source: 'bar.md',
      slug: 'bar'
    }).then(post => {
      postPermalink(post).should.eql(hexo.config.default_category + '/bar/');
      hexo.config.permalink = PERMALINK;
      return Post.removeById(post._id);
    });
  });

  it('extra data', () => {
    hexo.config.permalink = ':layout/:title/';
    postPermalink(post).should.eql(post.layout + '/foo/');
    hexo.config.permalink = PERMALINK;
  });

  it('id', () => {
    hexo.config.permalink = ':id';

    postPermalink(post).should.eql(post._id);

    post.id = 1;
    postPermalink(post).should.eql('1');

    hexo.config.permalink = PERMALINK;
  });

  it('name', () => {
    hexo.config.permalink = ':title/:name';

    return Post.insert({
      source: 'sub/bar.md',
      slug: 'sub/bar'
    }).then(post => {
      postPermalink(post).should.eql('sub/bar/bar');
      hexo.config.permalink = PERMALINK;
      return Post.removeById(post._id);
    });
  });

  it('post_title', () => {
    hexo.config.permalink = ':year/:month/:day/:post_title/';

    return Post.insert({
      source: 'sub/2015-05-06-my-new-post.md',
      slug: '2015-05-06-my-new-post',
      title: 'My New Post',
      date: moment('2015-05-06')
    }).then(post => {
      postPermalink(post).should.eql('2015/05/06/my-new-post/');
      hexo.config.permalink = PERMALINK;
      return Post.removeById(post._id);
    });
  });
});

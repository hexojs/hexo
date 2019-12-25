'use strict';

const moment = require('moment');

describe('post_permalink', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo();
  const postPermalink = require('../../../lib/plugins/filter/post_permalink').bind(hexo);
  const Post = hexo.model('Post');
  let post;

  before(async () => {
    hexo.config.permalink = ':year/:month/:day/:title/';
    hexo.config.permalink_defaults = {};

    await hexo.init();
    post = await Post.insert({
      source: 'foo.md',
      slug: 'foo',
      date: moment('2014-01-02')
    });
    const id = post._id;
    await post.setCategories(['foo', 'bar']);
    post = Post.findById(id);
  });

  it('default', () => {
    console.log(hexo.config.permalink_defaults);
    postPermalink(post).should.eql('2014/01/02/foo/');
  });

  it('categories', () => {
    hexo.config.permalink = ':category/:title/';
    postPermalink(post).should.eql('foo/bar/foo/');
  });

  it('uncategorized', async () => {
    hexo.config.permalink = ':category/:title/';

    const post = await Post.insert({
      source: 'bar.md',
      slug: 'bar'
    });
    postPermalink(post).should.eql(hexo.config.default_category + '/bar/');
    Post.removeById(post._id);
  });

  it('extra data', () => {
    hexo.config.permalink = ':layout/:title/';
    postPermalink(post).should.eql(post.layout + '/foo/');
  });

  it('id', () => {
    hexo.config.permalink = ':id';

    postPermalink(post).should.eql(post._id);

    post.id = 1;
    postPermalink(post).should.eql('1');
  });

  it('name', async () => {
    hexo.config.permalink = ':title/:name';

    const post = await Post.insert({
      source: 'sub/bar.md',
      slug: 'sub/bar'
    });
    postPermalink(post).should.eql('sub/bar/bar');
    Post.removeById(post._id);
  });

  it('post_title', async () => {
    hexo.config.permalink = ':year/:month/:day/:post_title/';

    const post = await Post.insert({
      source: 'sub/2015-05-06-my-new-post.md',
      slug: '2015-05-06-my-new-post',
      title: 'My New Post',
      date: moment('2015-05-06')
    });
    postPermalink(post).should.eql('2015/05/06/my-new-post/');
    Post.removeById(post._id);
  });

  it('hour and minute', async () => {
    hexo.config.permalink = ':year/:month/:day/:hour/:minute/:post_title/';

    const post = await Post.insert({
      source: 'sub/2015-05-06-my-new-post.md',
      slug: '2015-05-06-my-new-post',
      title: 'My New Post',
      date: moment('2015-05-06 12:13')
    });
    postPermalink(post).should.eql('2015/05/06/12/13/my-new-post/');
    Post.removeById(post._id);
  });

  it('time is omitted in front-matter', async () => {
    hexo.config.permalink = ':year/:month/:day/:hour/:minute/:post_title/';

    const post = await Post.insert({
      source: 'sub/2015-05-06-my-new-post.md',
      slug: '2015-05-06-my-new-post',
      title: 'My New Post',
      date: moment('2015-05-06')
    });
    postPermalink(post).should.eql('2015/05/06/00/00/my-new-post/');
    Post.removeById(post._id);
  });

  it('permalink_defaults', async () => {
    hexo.config.permalink = 'posts/:lang/:title/';
    hexo.config.permalink_defaults = {lang: 'en'};

    const posts = await Post.insert([{
      source: 'my-new-post.md',
      slug: 'my-new-post',
      title: 'My New Post1'
    }, {
      source: 'my-new-fr-post.md',
      slug: 'my-new-fr-post',
      title: 'My New Post2',
      lang: 'fr'
    }]);
    postPermalink(posts[0]).should.eql('posts/en/my-new-post/');
    postPermalink(posts[1]).should.eql('posts/fr/my-new-fr-post/');

    await Promise.all(posts.map(post => Post.removeById(post._id)));
  });

  it('permalink_defaults - null', async () => {
    hexo.config.permalink = 'posts/:lang/:title/';
    hexo.config.permalink_defaults = null;

    const posts = await Post.insert([{
      source: 'my-new-post.md',
      slug: 'my-new-post',
      title: 'My New Post1',
      lang: 'en'
    }, {
      source: 'my-new-post-2.md',
      slug: 'my-new-post-2',
      title: 'My New Post2',
      lang: 'fr'
    }]);
    postPermalink(posts[0]).should.eql('posts/en/my-new-post/');
    postPermalink(posts[1]).should.eql('posts/fr/my-new-post-2/');

    await Promise.all(posts.map(post => Post.removeById(post._id)));
  });
});

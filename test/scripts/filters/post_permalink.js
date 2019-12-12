'use strict';

const moment = require('moment');

const PERMALINK = ':year/:month/:day/:title/';

describe('post_permalink', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo();
  const postPermalink = require('../../../lib/plugins/filter/post_permalink').bind(hexo);
  const Post = hexo.model('Post');
  let post;

  hexo.config.permalink = PERMALINK;

  before(() => {
    let id;

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

  it('hour and minute', () => {
    hexo.config.permalink = ':year/:month/:day/:hour/:minute/:post_title/';

    return Post.insert({
      source: 'sub/2015-05-06-my-new-post.md',
      slug: '2015-05-06-my-new-post',
      title: 'My New Post',
      date: moment('2015-05-06 12:13')
    }).then(post => {
      postPermalink(post).should.eql('2015/05/06/12/13/my-new-post/');
      hexo.config.permalink = PERMALINK;
      return Post.removeById(post._id);
    });
  });

  it('time is omitted in front-matter', () => {
    hexo.config.permalink = ':year/:month/:day/:hour/:minute/:post_title/';

    return Post.insert({
      source: 'sub/2015-05-06-my-new-post.md',
      slug: '2015-05-06-my-new-post',
      title: 'My New Post',
      date: moment('2015-05-06')
    }).then(post => {
      postPermalink(post).should.eql('2015/05/06/00/00/my-new-post/');
      hexo.config.permalink = PERMALINK;
      return Post.removeById(post._id);
    });
  });

  it('permalink_defaults', () => {
    hexo.config.permalink = 'posts/:lang/:title/';
    const orgPermalinkDefaults = hexo.config.permalink_defaults;
    hexo.config.permalink_defaults = {lang: 'en'};

    return Post.insert([{
      source: 'my-new-post.md',
      slug: 'my-new-post',
      title: 'My New Post1'
    }, {
      source: 'my-new-fr-post.md',
      slug: 'my-new-fr-post',
      title: 'My New Post2',
      lang: 'fr'
    }]).then(posts => {
      postPermalink(posts[0]).should.eql('posts/en/my-new-post/');
      postPermalink(posts[1]).should.eql('posts/fr/my-new-fr-post/');

      hexo.config.permalink = PERMALINK;
      hexo.config.permalink_defaults = orgPermalinkDefaults;
      return Promise.all(posts.map(post => Post.removeById(post._id)));
    });
  });

  it('permalink_defaults - null', () => {
    hexo.config.permalink = 'posts/:lang/:title/';
    const orgPermalinkDefaults = hexo.config.permalink_defaults;
    hexo.config.permalink_defaults = null;

    return Post.insert([{
      source: 'my-new-post.md',
      slug: 'my-new-post',
      title: 'My New Post1',
      lang: 'en'
    }, {
      source: 'my-new-post-2.md',
      slug: 'my-new-post-2',
      title: 'My New Post2',
      lang: 'fr'
    }]).then(posts => {
      postPermalink(posts[0]).should.eql('posts/en/my-new-post/');
      postPermalink(posts[1]).should.eql('posts/fr/my-new-post-2/');

      hexo.config.permalink = PERMALINK;
      hexo.config.permalink_defaults = orgPermalinkDefaults;
      return Promise.all(posts.map(post => Post.removeById(post._id)));
    });
  });
});

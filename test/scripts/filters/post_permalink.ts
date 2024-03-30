import moment from 'moment';
import Hexo from '../../../lib/hexo';
import postPermalinkFilter from '../../../lib/plugins/filter/post_permalink';
type PostPermalinkFilterParams = Parameters<typeof postPermalinkFilter>;
type PostPermalinkFilterReturn = ReturnType<typeof postPermalinkFilter>;

describe('post_permalink', () => {
  const hexo = new Hexo();
  const postPermalink: (...args: PostPermalinkFilterParams) => PostPermalinkFilterReturn = postPermalinkFilter.bind(hexo);
  const Post = hexo.model('Post');
  let post;

  before(async () => {
    hexo.config.permalink = ':year/:month/:day/:title/';
    hexo.config.permalink_defaults = {};

    await hexo.init();
    const apost = await Post.insert({
      source: 'foo.md',
      slug: 'foo',
      date: moment('2014-01-02')
    });
    const id = apost._id;
    await apost.setCategories(['foo', 'bar']);
    post = Post.findById(id);
  });

  it('default', () => {
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

  it('hour minute and second', async () => {
    hexo.config.permalink = ':year/:month/:day/:hour/:minute/:second/:post_title/';

    const post = await Post.insert({
      source: 'sub/2015-05-06-my-new-post.md',
      slug: '2015-05-06-my-new-post',
      title: 'My New Post',
      date: moment('2015-05-06 12:13:14')
    });
    postPermalink(post).should.eql('2015/05/06/12/13/14/my-new-post/');
    Post.removeById(post._id);
  });

  it('time is omitted in front-matter', async () => {
    hexo.config.permalink = ':year/:month/:day/:hour/:minute/:second/:post_title/';

    const post = await Post.insert({
      source: 'sub/2015-05-06-my-new-post.md',
      slug: '2015-05-06-my-new-post',
      title: 'My New Post',
      date: moment('2015-05-06')
    });
    postPermalink(post).should.eql('2015/05/06/00/00/00/my-new-post/');
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
    hexo.config.permalink_defaults = null as any;

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

  it('permalink - should override everything', async () => {
    hexo.config.permalink = ':year/:month/:day/:title/';

    const posts = await Post.insert([{
      source: 'my-new-post.md',
      slug: 'hexo/permalink-test',
      __permalink: 'hexo/permalink-test',
      title: 'Permalink Test',
      date: moment('2014-01-02')
    }, {
      source: 'another-new-post.md',
      slug: '/hexo-hexo/permalink-test-2',
      __permalink: '/hexo-hexo/permalink-test-2',
      title: 'Permalink Test',
      date: moment('2014-01-02')
    }]);

    postPermalink(posts[0]).should.eql('/hexo/permalink-test');
    postPermalink(posts[1]).should.eql('/hexo-hexo/permalink-test-2');

    await Promise.all(posts.map(post => Post.removeById(post._id)));
  });

  it('permalink - should end with / or .html - 1', async () => {
    hexo.config.post_asset_folder = true;
    hexo.config.permalink = ':year/:month/:day/:title';

    const post = await Post.insert({
      source: 'foo.md',
      slug: 'foo',
      date: moment('2014-01-02')
    });

    postPermalink(post).should.eql('2014/01/02/foo/');

    Post.removeById(post._id);
    hexo.config.post_asset_folder = false;
  });


  it('permalink - should end with / or .html - 2', async () => {
    hexo.config.post_asset_folder = true;

    const posts = await Post.insert([{
      source: 'my-new-post.md',
      slug: 'hexo/permalink-test',
      __permalink: 'hexo/permalink-test',
      title: 'Permalink Test',
      date: moment('2014-01-02')
    }, {
      source: 'another-new-post.md',
      slug: '/hexo-hexo/permalink-test-2',
      __permalink: '/hexo-hexo/permalink-test-2/',
      title: 'Permalink Test',
      date: moment('2014-01-02')
    }, {
      source: 'another-another-new-post.md',
      slug: '/hexo-hexo/permalink-test-3',
      __permalink: '/hexo-hexo/permalink-test-3.html',
      title: 'Permalink Test',
      date: moment('2014-01-02')
    }]);

    postPermalink(posts[0]).should.eql('/hexo/permalink-test/');
    postPermalink(posts[1]).should.eql('/hexo-hexo/permalink-test-2/');
    postPermalink(posts[2]).should.eql('/hexo-hexo/permalink-test-3.html');

    await Promise.all(posts.map(post => Post.removeById(post._id)));
    hexo.config.post_asset_folder = false;
  });
});

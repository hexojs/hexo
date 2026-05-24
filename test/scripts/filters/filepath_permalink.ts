import { should } from 'chai';
import Hexo from 'hexo';
import moment from 'moment';
import path from 'path';
import postPermalinkFilter from '../../../lib/plugins/filter/post_permalink';

// Usage: `mocha test/scripts/filters/filepath_permalink.ts --require ts-node/register`
should(); // <-- This line is essential to enable `.should` assertions

type PostPermalinkFilterParams = Parameters<typeof postPermalinkFilter>;
type PostPermalinkFilterReturn = ReturnType<typeof postPermalinkFilter>;

describe('Hexo Filter (TypeScript)', () => {
  // Initialize hexo
  const hexo = new Hexo(path.join(__dirname, '../../fixtures'), { silent: true });
  // Initialize permalink parser
  const postPermalink: (...args: PostPermalinkFilterParams) => PostPermalinkFilterReturn
    = postPermalinkFilter.bind(hexo);
  // Initialize post model
  const Post = hexo.model('Post');

  before(async () => {
    // Load configurations
    await hexo.init();
  });

  it(':filepath.html', async () => {
    hexo.config.permalink = ':filepath.html';

    const posts = await Post.insert([
      {
        source: 'foo.md',
        slug: 'foo',
        date: moment('2014-01-02')
      },
      {
        source: '2025/01/my-foo.md',
        slug: '2025/01/my-foo',
        date: moment('2014-01-04')
      }
    ]);
    postPermalink(posts[0]).should.eql('foo.html');
    postPermalink(posts[1]).should.eql('2025/01/my-foo.html');
  });

  it('filepath - inside folder', async () => {
    hexo.config.permalink = ':year/:month/:day/:filepath/';

    const post = await Post.insert({
      source: 'sub/2025-05-06-my-new-post.md',
      slug: '2025-05-06-my-new-post',
      title: 'My New Post',
      date: moment('2025-05-06')
    });
    postPermalink(post).should.eql('2025/05/06/sub/2025-05-06-my-new-post/');
    Post.removeById(post._id);
  });

  it('filepath - within spaces', async () => {
    hexo.config.permalink = ':year/:month/:filepath.html';

    const post = await Post.insert({
      source: 'space folder/my new post with space.md',
      slug: 'space folder/my new post with space',
      title: 'My New Post With Space',
      date: moment('2025-10-07')
    });
    postPermalink(post).should.eql('2025/10/space folder/my new post with space.html');
    Post.removeById(post._id);
  });

  it('filepath - with language', async () => {
    hexo.config.permalink = 'posts/:lang/:filepath/';
    hexo.config.permalink_defaults = { lang: 'en' };

    const posts = await Post.insert([
      {
        source: 'my-new-post.md',
        slug: 'my-new-post',
        title: 'My New Post1'
      },
      {
        source: 'my-new-fr-post.md',
        slug: 'my-new-fr-post',
        title: 'My New Post2',
        lang: 'fr'
      }
    ]);
    postPermalink(posts[0]).should.eql('posts/en/my-new-post/');
    postPermalink(posts[1]).should.eql('posts/fr/my-new-fr-post/');
  });

  it('permalink - should override everything', async () => {
    hexo.config.permalink = ':year/:month/:day/:filepath/';

    const posts = await Post.insert([{
      source: 'my-new-post.md',
      slug: 'hexo/permalink-test-filepath',
      __permalink: 'hexo/permalink-test-filepath',
      title: 'Permalink Test',
      date: moment('2014-01-02')
    }, {
      source: 'another-new-post.md',
      slug: '/hexo-hexo/permalink-test-2',
      __permalink: '/hexo-hexo/permalink-test-2',
      title: 'Permalink Test',
      date: moment('2014-01-02')
    }]);

    postPermalink(posts[0]).should.eql('/hexo/permalink-test-filepath');
    postPermalink(posts[1]).should.eql('/hexo-hexo/permalink-test-2');

    await Promise.all(posts.map(post => Post.removeById(post._id)));
  });
});

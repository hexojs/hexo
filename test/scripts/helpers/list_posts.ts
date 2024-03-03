import Hexo from '../../../lib/hexo';
import listPostsHelper from '../../../lib/plugins/helper/list_posts';
type ListPostsHelperParams = Parameters<typeof listPostsHelper>;
type ListPostsHelperReturn = ReturnType<typeof listPostsHelper>;

describe('list_posts', () => {
  const hexo = new Hexo(__dirname);
  const Post = hexo.model('Post');

  const ctx: any = {
    config: hexo.config
  };

  const listPosts: (...args: ListPostsHelperParams) => ListPostsHelperReturn = listPostsHelper.bind(ctx);

  hexo.config.permalink = ':title/';

  before(async () => {
    await hexo.init();
    await Post.insert([
      {source: 'foo', slug: 'foo', title: 'Its', date: 1e8},
      {source: 'bar', slug: 'bar', title: 'Chemistry', date: 1e8 + 1},
      {source: 'baz', slug: 'baz', title: 'Bitch', date: 1e8 - 1}
    ]);

    hexo.locals.invalidate();
    ctx.site = hexo.locals.toObject();
  });

  it('default', () => {
    const result = listPosts();

    result.should.eql([
      '<ul class="post-list">',
      '<li class="post-list-item"><a class="post-list-link" href="/bar/">Chemistry</a></li>',
      '<li class="post-list-item"><a class="post-list-link" href="/foo/">Its</a></li>',
      '<li class="post-list-item"><a class="post-list-link" href="/baz/">Bitch</a></li>',
      '</ul>'
    ].join(''));
  });

  it('specified collection', () => {
    const result = listPosts(Post.find({
      title: 'Its'
    }));

    result.should.eql([
      '<ul class="post-list">',
      '<li class="post-list-item"><a class="post-list-link" href="/foo/">Its</a></li>',
      '</ul>'
    ].join(''));
  });

  it('style: false', () => {
    const result = listPosts({
      style: false
    });

    result.should.eql([
      '<a class="post-link" href="/bar/">Chemistry</a>',
      '<a class="post-link" href="/foo/">Its</a>',
      '<a class="post-link" href="/baz/">Bitch</a>'
    ].join(', '));
  });

  it('orderby', () => {
    const result = listPosts({
      orderby: 'title'
    });

    result.should.eql([
      '<ul class="post-list">',
      '<li class="post-list-item"><a class="post-list-link" href="/foo/">Its</a></li>',
      '<li class="post-list-item"><a class="post-list-link" href="/bar/">Chemistry</a></li>',
      '<li class="post-list-item"><a class="post-list-link" href="/baz/">Bitch</a></li>',
      '</ul>'
    ].join(''));
  });

  it('order', () => {
    const result = listPosts({
      order: 1
    });

    result.should.eql([
      '<ul class="post-list">',
      '<li class="post-list-item"><a class="post-list-link" href="/baz/">Bitch</a></li>',
      '<li class="post-list-item"><a class="post-list-link" href="/foo/">Its</a></li>',
      '<li class="post-list-item"><a class="post-list-link" href="/bar/">Chemistry</a></li>',
      '</ul>'
    ].join(''));
  });

  it('class', () => {
    const result = listPosts({
      class: 'test'
    });

    result.should.eql([
      '<ul class="test-list">',
      '<li class="test-list-item"><a class="test-list-link" href="/bar/">Chemistry</a></li>',
      '<li class="test-list-item"><a class="test-list-link" href="/foo/">Its</a></li>',
      '<li class="test-list-item"><a class="test-list-link" href="/baz/">Bitch</a></li>',
      '</ul>'
    ].join(''));
  });

  it('transform', () => {
    const result = listPosts({
      transform(str) {
        return str.toUpperCase();
      }
    });

    result.should.eql([
      '<ul class="post-list">',
      '<li class="post-list-item"><a class="post-list-link" href="/bar/">CHEMISTRY</a></li>',
      '<li class="post-list-item"><a class="post-list-link" href="/foo/">ITS</a></li>',
      '<li class="post-list-item"><a class="post-list-link" href="/baz/">BITCH</a></li>',
      '</ul>'
    ].join(''));
  });

  it('separator', () => {
    const result = listPosts({
      style: false,
      separator: ''
    });

    result.should.eql([
      '<a class="post-link" href="/bar/">Chemistry</a>',
      '<a class="post-link" href="/foo/">Its</a>',
      '<a class="post-link" href="/baz/">Bitch</a>'
    ].join(''));
  });

  it('amount', () => {
    const result = listPosts({
      amount: 2
    });

    result.should.eql([
      '<ul class="post-list">',
      '<li class="post-list-item"><a class="post-list-link" href="/bar/">Chemistry</a></li>',
      '<li class="post-list-item"><a class="post-list-link" href="/foo/">Its</a></li>',
      '</ul>'
    ].join(''));
  });
});

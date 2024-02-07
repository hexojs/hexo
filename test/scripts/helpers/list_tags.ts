import Hexo from '../../../lib/hexo';
import listTagsHelper from '../../../lib/plugins/helper/list_tags';
type ListTagsHelperParams = Parameters<typeof listTagsHelper>;
type ListTagsHelperReturn = ReturnType<typeof listTagsHelper>;

describe('list_tags', () => {
  const hexo = new Hexo(__dirname);
  const Post = hexo.model('Post');
  const Tag = hexo.model('Tag');

  const ctx: any = {
    config: hexo.config
  };

  const listTags: (...args: ListTagsHelperParams) => ListTagsHelperReturn = listTagsHelper.bind(ctx);

  before(async () => {
    await hexo.init();
    const posts = await Post.insert([
      {source: 'foo', slug: 'foo'},
      {source: 'bar', slug: 'bar'},
      {source: 'baz', slug: 'baz'},
      {source: 'boo', slug: 'boo'}
    ]);
    // TODO: Warehouse needs to add a mutex lock when writing data to avoid data sync problem
    await Promise.all([
      ['foo'],
      ['baz'],
      ['baz'],
      ['bar']
    ].map((tags, i) => posts[i].setTags(tags)));

    hexo.locals.invalidate();
    ctx.site = hexo.locals.toObject();
  });

  it('default', () => {
    const result = listTags();

    result.should.eql([
      '<ul class="tag-list" itemprop="keywords">',
      '<li class="tag-list-item"><a class="tag-list-link" href="/tags/bar/" rel="tag">bar</a><span class="tag-list-count">1</span></li>',
      '<li class="tag-list-item"><a class="tag-list-link" href="/tags/baz/" rel="tag">baz</a><span class="tag-list-count">2</span></li>',
      '<li class="tag-list-item"><a class="tag-list-link" href="/tags/foo/" rel="tag">foo</a><span class="tag-list-count">1</span></li>',
      '</ul>'
    ].join(''));
  });

  it('specified collection', () => {
    const result = listTags(Tag.find({
      name: /^b/
    }));

    result.should.eql([
      '<ul class="tag-list" itemprop="keywords">',
      '<li class="tag-list-item"><a class="tag-list-link" href="/tags/bar/" rel="tag">bar</a><span class="tag-list-count">1</span></li>',
      '<li class="tag-list-item"><a class="tag-list-link" href="/tags/baz/" rel="tag">baz</a><span class="tag-list-count">2</span></li>',
      '</ul>'
    ].join(''));
  });

  it('style: false', () => {
    const result = listTags({
      style: false
    });

    result.should.eql([
      '<a class="tag-link" href="/tags/bar/" rel="tag">bar<span class="tag-count">1</span></a>',
      '<a class="tag-link" href="/tags/baz/" rel="tag">baz<span class="tag-count">2</span></a>',
      '<a class="tag-link" href="/tags/foo/" rel="tag">foo<span class="tag-count">1</span></a>'
    ].join(', '));
  });

  it('show_count: false', () => {
    const result = listTags({
      show_count: false
    });

    result.should.eql([
      '<ul class="tag-list" itemprop="keywords">',
      '<li class="tag-list-item"><a class="tag-list-link" href="/tags/bar/" rel="tag">bar</a></li>',
      '<li class="tag-list-item"><a class="tag-list-link" href="/tags/baz/" rel="tag">baz</a></li>',
      '<li class="tag-list-item"><a class="tag-list-link" href="/tags/foo/" rel="tag">foo</a></li>',
      '</ul>'
    ].join(''));
  });

  it('class', () => {
    const result = listTags({
      class: 'test'
    });

    result.should.eql([
      '<ul class="test-list" itemprop="keywords">',
      '<li class="test-list-item"><a class="test-list-link" href="/tags/bar/" rel="tag">bar</a><span class="test-list-count">1</span></li>',
      '<li class="test-list-item"><a class="test-list-link" href="/tags/baz/" rel="tag">baz</a><span class="test-list-count">2</span></li>',
      '<li class="test-list-item"><a class="test-list-link" href="/tags/foo/" rel="tag">foo</a><span class="test-list-count">1</span></li>',
      '</ul>'
    ].join(''));
  });

  it('custom class', () => {
    const result = listTags({
      class: {
        ul: 'lorem',
        li: 'ipsum',
        a: 'tempor',
        count: 'dolor'
      }
    });

    result.should.eql([
      '<ul class="lorem" itemprop="keywords">',
      '<li class="ipsum"><a class="tempor" href="/tags/bar/" rel="tag">bar</a><span class="dolor">1</span></li>',
      '<li class="ipsum"><a class="tempor" href="/tags/baz/" rel="tag">baz</a><span class="dolor">2</span></li>',
      '<li class="ipsum"><a class="tempor" href="/tags/foo/" rel="tag">foo</a><span class="dolor">1</span></li>',
      '</ul>'
    ].join(''));
  });

  it('custom class not list', () => {
    const result = listTags({
      style: false,
      show_count: true,
      separator: '',
      class: {
        a: 'tempor',
        label: 'lorem',
        count: 'dolor'
      }
    });

    result.should.eql([
      '<a class="tempor" href="/tags/bar/" rel="tag"><span class="lorem">bar</span><span class="dolor">1</span></a>',
      '<a class="tempor" href="/tags/baz/" rel="tag"><span class="lorem">baz</span><span class="dolor">2</span></a>',
      '<a class="tempor" href="/tags/foo/" rel="tag"><span class="lorem">foo</span><span class="dolor">1</span></a>'
    ].join(''));
  });

  it('orderby', () => {
    const result = listTags({
      orderby: 'length'
    });

    result.should.eql([
      '<ul class="tag-list" itemprop="keywords">',
      '<li class="tag-list-item"><a class="tag-list-link" href="/tags/foo/" rel="tag">foo</a><span class="tag-list-count">1</span></li>',
      '<li class="tag-list-item"><a class="tag-list-link" href="/tags/bar/" rel="tag">bar</a><span class="tag-list-count">1</span></li>',
      '<li class="tag-list-item"><a class="tag-list-link" href="/tags/baz/" rel="tag">baz</a><span class="tag-list-count">2</span></li>',
      '</ul>'
    ].join(''));
  });

  it('order', () => {
    const result = listTags({
      order: -1
    });

    result.should.eql([
      '<ul class="tag-list" itemprop="keywords">',
      '<li class="tag-list-item"><a class="tag-list-link" href="/tags/foo/" rel="tag">foo</a><span class="tag-list-count">1</span></li>',
      '<li class="tag-list-item"><a class="tag-list-link" href="/tags/baz/" rel="tag">baz</a><span class="tag-list-count">2</span></li>',
      '<li class="tag-list-item"><a class="tag-list-link" href="/tags/bar/" rel="tag">bar</a><span class="tag-list-count">1</span></li>',
      '</ul>'
    ].join(''));
  });

  it('transform', () => {
    const result = listTags({
      transform(name) {
        return name.toUpperCase();
      }
    });

    result.should.eql([
      '<ul class="tag-list" itemprop="keywords">',
      '<li class="tag-list-item"><a class="tag-list-link" href="/tags/bar/" rel="tag">BAR</a><span class="tag-list-count">1</span></li>',
      '<li class="tag-list-item"><a class="tag-list-link" href="/tags/baz/" rel="tag">BAZ</a><span class="tag-list-count">2</span></li>',
      '<li class="tag-list-item"><a class="tag-list-link" href="/tags/foo/" rel="tag">FOO</a><span class="tag-list-count">1</span></li>',
      '</ul>'
    ].join(''));
  });

  it('separator', () => {
    const result = listTags({
      style: false,
      separator: ''
    });

    result.should.eql([
      '<a class="tag-link" href="/tags/bar/" rel="tag">bar<span class="tag-count">1</span></a>',
      '<a class="tag-link" href="/tags/baz/" rel="tag">baz<span class="tag-count">2</span></a>',
      '<a class="tag-link" href="/tags/foo/" rel="tag">foo<span class="tag-count">1</span></a>'
    ].join(''));
  });

  it('amount', () => {
    const result = listTags({
      amount: 2
    });

    result.should.eql([
      '<ul class="tag-list" itemprop="keywords">',
      '<li class="tag-list-item"><a class="tag-list-link" href="/tags/bar/" rel="tag">bar</a><span class="tag-list-count">1</span></li>',
      '<li class="tag-list-item"><a class="tag-list-link" href="/tags/baz/" rel="tag">baz</a><span class="tag-list-count">2</span></li>',
      '</ul>'
    ].join(''));
  });
});

describe('list_tags transform', () => {
  const hexo = new Hexo(__dirname);
  const Post = hexo.model('Post');

  const ctx: any = {
    config: hexo.config
  };

  const listTags: (...args: ListTagsHelperParams) => ListTagsHelperReturn = listTagsHelper.bind(ctx);

  before(async () => {
    await hexo.init();
    const posts = await Post.insert([
      {source: 'foo', slug: 'foo'}
    ]);

    // TODO: Warehouse needs to add a mutex lock when writing data to avoid data sync problem
    await Promise.all([
      ['bad<b>HTML</b>']
    ].map((tags, i) => posts[i].setTags(tags)));

    hexo.locals.invalidate();
    ctx.site = hexo.locals.toObject();
  });

  // no transform should escape HTML
  it('no transform', () => {
    const result = listTags();

    result.should.eql([
      '<ul class="tag-list" itemprop="keywords">',
      '<li class="tag-list-item"><a class="tag-list-link" href="/tags/bad-b-HTML-b/" rel="tag">bad&lt;b&gt;HTML&lt;&#x2F;b&gt;</a><span class="tag-list-count">1</span></li>',
      '</ul>'
    ].join(''));
  });
});

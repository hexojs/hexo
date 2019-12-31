'use strict';

describe('list_tags', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(__dirname);
  const Post = hexo.model('Post');
  const Tag = hexo.model('Tag');

  const ctx = {
    config: hexo.config
  };

  ctx.url_for = require('../../../lib/plugins/helper/url_for').bind(ctx);

  const listTags = require('../../../lib/plugins/helper/list_tags').bind(ctx);

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

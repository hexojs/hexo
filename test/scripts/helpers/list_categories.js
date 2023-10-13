'use strict';

describe('list_categories', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo(__dirname);
  const Post = hexo.model('Post');
  const Category = hexo.model('Category');

  const ctx = {
    config: hexo.config
  };

  const listCategories = require('../../../dist/plugins/helper/list_categories').bind(ctx);

  before(async () => {
    await hexo.init();
    const posts = await Post.insert([
      {source: 'foo', slug: 'foo'},
      {source: 'bar', slug: 'bar'},
      {source: 'baz', slug: 'baz'},
      {source: 'boo', slug: 'boo'},
      {source: 'bat', slug: 'bat'}
    ]);
    await Promise.all([
      ['baz'],
      ['baz', 'bar'],
      ['foo'],
      ['baz'],
      ['bat', ['baz', 'bar']]
    ].map((cats, i) => posts[i].setCategories(cats)));

    hexo.locals.invalidate();
    ctx.site = hexo.locals.toObject();
    ctx.page = ctx.site.posts.data[1];
  });

  it('default', () => {
    const result = listCategories();

    result.should.eql([
      '<ul class="category-list">',
      '<li class="category-list-item">',
      '<a class="category-list-link" href="/categories/bat/">bat</a><span class="category-list-count">1</span>',
      '</li>',
      '<li class="category-list-item">',
      '<a class="category-list-link" href="/categories/baz/">baz</a><span class="category-list-count">4</span>',
      '<ul class="category-list-child">',
      '<li class="category-list-item">',
      '<a class="category-list-link" href="/categories/baz/bar/">bar</a><span class="category-list-count">2</span>',
      '</li>',
      '</ul>',
      '</li>',
      '<li class="category-list-item">',
      '<a class="category-list-link" href="/categories/foo/">foo</a><span class="category-list-count">1</span>',
      '</li>',
      '</ul>'
    ].join(''));
  });

  it('specified collection', () => {
    const result = listCategories(Category.find({
      parent: {$exists: false}
    }));

    result.should.eql([
      '<ul class="category-list">',
      '<li class="category-list-item">',
      '<a class="category-list-link" href="/categories/bat/">bat</a><span class="category-list-count">1</span>',
      '</li>',
      '<li class="category-list-item">',
      '<a class="category-list-link" href="/categories/baz/">baz</a><span class="category-list-count">4</span>',
      '</li>',
      '<li class="category-list-item">',
      '<a class="category-list-link" href="/categories/foo/">foo</a><span class="category-list-count">1</span>',
      '</li>',
      '</ul>'
    ].join(''));
  });

  it('style: false', () => {
    const result = listCategories({
      style: false
    });

    result.should.eql([
      '<a class="category-link" href="/categories/bat/">bat<span class="category-count">1</span></a>',
      '<a class="category-link" href="/categories/baz/">baz<span class="category-count">4</span></a>',
      '<a class="category-link" href="/categories/baz/bar/">bar<span class="category-count">2</span></a>',
      '<a class="category-link" href="/categories/foo/">foo<span class="category-count">1</span></a>'
    ].join(', '));
  });

  it('show_count: false', () => {
    const result = listCategories({
      show_count: false
    });

    result.should.eql([
      '<ul class="category-list">',
      '<li class="category-list-item">',
      '<a class="category-list-link" href="/categories/bat/">bat</a>',
      '</li>',
      '<li class="category-list-item">',
      '<a class="category-list-link" href="/categories/baz/">baz</a>',
      '<ul class="category-list-child">',
      '<li class="category-list-item">',
      '<a class="category-list-link" href="/categories/baz/bar/">bar</a>',
      '</li>',
      '</ul>',
      '</li>',
      '<li class="category-list-item">',
      '<a class="category-list-link" href="/categories/foo/">foo</a>',
      '</li>',
      '</ul>'
    ].join(''));
  });

  it('class', () => {
    const result = listCategories({
      class: 'test'
    });

    result.should.eql([
      '<ul class="test-list">',
      '<li class="test-list-item">',
      '<a class="test-list-link" href="/categories/bat/">bat</a><span class="test-list-count">1</span>',
      '</li>',
      '<li class="test-list-item">',
      '<a class="test-list-link" href="/categories/baz/">baz</a><span class="test-list-count">4</span>',
      '<ul class="test-list-child">',
      '<li class="test-list-item">',
      '<a class="test-list-link" href="/categories/baz/bar/">bar</a><span class="test-list-count">2</span>',
      '</li>',
      '</ul>',
      '</li>',
      '<li class="test-list-item">',
      '<a class="test-list-link" href="/categories/foo/">foo</a><span class="test-list-count">1</span>',
      '</li>',
      '</ul>'
    ].join(''));
  });

  it('depth', () => {
    const result = listCategories({
      depth: 1
    });

    result.should.eql([
      '<ul class="category-list">',
      '<li class="category-list-item">',
      '<a class="category-list-link" href="/categories/bat/">bat</a><span class="category-list-count">1</span>',
      '</li>',
      '<li class="category-list-item">',
      '<a class="category-list-link" href="/categories/baz/">baz</a><span class="category-list-count">4</span>',
      '</li>',
      '<li class="category-list-item">',
      '<a class="category-list-link" href="/categories/foo/">foo</a><span class="category-list-count">1</span>',
      '</li>',
      '</ul>'
    ].join(''));
  });

  it('orderby', () => {
    const result = listCategories({
      orderby: 'length'
    });

    result.should.eql([
      '<ul class="category-list">',
      '<li class="category-list-item">',
      '<a class="category-list-link" href="/categories/foo/">foo</a><span class="category-list-count">1</span>',
      '</li>',
      '<li class="category-list-item">',
      '<a class="category-list-link" href="/categories/bat/">bat</a><span class="category-list-count">1</span>',
      '</li>',
      '<li class="category-list-item">',
      '<a class="category-list-link" href="/categories/baz/">baz</a><span class="category-list-count">4</span>',
      '<ul class="category-list-child">',
      '<li class="category-list-item">',
      '<a class="category-list-link" href="/categories/baz/bar/">bar</a><span class="category-list-count">2</span>',
      '</li>',
      '</ul>',
      '</li>',
      '</ul>'
    ].join(''));
  });

  it('order', () => {
    const result = listCategories({
      order: -1
    });

    result.should.eql([
      '<ul class="category-list">',
      '<li class="category-list-item">',
      '<a class="category-list-link" href="/categories/foo/">foo</a><span class="category-list-count">1</span>',
      '</li>',
      '<li class="category-list-item">',
      '<a class="category-list-link" href="/categories/baz/">baz</a><span class="category-list-count">4</span>',
      '<ul class="category-list-child">',
      '<li class="category-list-item">',
      '<a class="category-list-link" href="/categories/baz/bar/">bar</a><span class="category-list-count">2</span>',
      '</li>',
      '</ul>',
      '</li>',
      '<li class="category-list-item">',
      '<a class="category-list-link" href="/categories/bat/">bat</a><span class="category-list-count">1</span>',
      '</li>',
      '</ul>'
    ].join(''));
  });

  it('transform', () => {
    const result = listCategories({
      transform(name) {
        return name.toUpperCase();
      }
    });

    result.should.eql([
      '<ul class="category-list">',
      '<li class="category-list-item">',
      '<a class="category-list-link" href="/categories/bat/">BAT</a><span class="category-list-count">1</span>',
      '</li>',
      '<li class="category-list-item">',
      '<a class="category-list-link" href="/categories/baz/">BAZ</a><span class="category-list-count">4</span>',
      '<ul class="category-list-child">',
      '<li class="category-list-item">',
      '<a class="category-list-link" href="/categories/baz/bar/">BAR</a><span class="category-list-count">2</span>',
      '</li>',
      '</ul>',
      '</li>',
      '<li class="category-list-item">',
      '<a class="category-list-link" href="/categories/foo/">FOO</a><span class="category-list-count">1</span>',
      '</li>',
      '</ul>'
    ].join(''));
  });

  it('separator (blank)', () => {
    const result = listCategories({
      style: false,
      separator: ''
    });

    result.should.eql([
      '<a class="category-link" href="/categories/bat/">bat<span class="category-count">1</span></a>',
      '<a class="category-link" href="/categories/baz/">baz<span class="category-count">4</span></a>',
      '<a class="category-link" href="/categories/baz/bar/">bar<span class="category-count">2</span></a>',
      '<a class="category-link" href="/categories/foo/">foo<span class="category-count">1</span></a>'
    ].join(''));
  });

  it('separator (non-blank)', () => {
    const result = listCategories({
      style: false,
      separator: '|'
    });

    result.should.eql([
      '<a class="category-link" href="/categories/bat/">bat<span class="category-count">1</span></a>|',
      '<a class="category-link" href="/categories/baz/">baz<span class="category-count">4</span></a>|',
      '<a class="category-link" href="/categories/baz/bar/">bar<span class="category-count">2</span></a>|',
      '<a class="category-link" href="/categories/foo/">foo<span class="category-count">1</span></a>'
    ].join(''));
  });

  it('children-indicator', () => {
    const result = listCategories({
      children_indicator: 'has-children'
    });

    result.should.eql([
      '<ul class="category-list">',
      '<li class="category-list-item">',
      '<a class="category-list-link" href="/categories/bat/">bat</a><span class="category-list-count">1</span>',
      '</li>',
      '<li class="category-list-item has-children">',
      '<a class="category-list-link" href="/categories/baz/">baz</a><span class="category-list-count">4</span>',
      '<ul class="category-list-child">',
      '<li class="category-list-item">',
      '<a class="category-list-link" href="/categories/baz/bar/">bar</a><span class="category-list-count">2</span>',
      '</li>',
      '</ul>',
      '</li>',
      '<li class="category-list-item">',
      '<a class="category-list-link" href="/categories/foo/">foo</a><span class="category-list-count">1</span>',
      '</li>',
      '</ul>'
    ].join(''));
  });

  it('show-current', () => {
    const result = listCategories({
      show_current: true
    });

    result.should.eql([
      '<ul class="category-list">',
      '<li class="category-list-item">',
      '<a class="category-list-link" href="/categories/bat/">bat</a><span class="category-list-count">1</span>',
      '</li>',
      '<li class="category-list-item">',
      '<a class="category-list-link current" href="/categories/baz/">baz</a><span class="category-list-count">4</span>',
      '<ul class="category-list-child">',
      '<li class="category-list-item">',
      '<a class="category-list-link current" href="/categories/baz/bar/">bar</a><span class="category-list-count">2</span>',
      '</li>',
      '</ul>',
      '</li>',
      '<li class="category-list-item">',
      '<a class="category-list-link" href="/categories/foo/">foo</a><span class="category-list-count">1</span>',
      '</li>',
      '</ul>'
    ].join(''));
  });
});

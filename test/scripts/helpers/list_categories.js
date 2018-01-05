var should = require('chai').should(); // eslint-disable-line
var Promise = require('bluebird');

describe('list_categories', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);
  var Post = hexo.model('Post');
  var Category = hexo.model('Category');

  var ctx = {
    config: hexo.config
  };

  ctx.url_for = require('../../../lib/plugins/helper/url_for').bind(ctx);

  var listCategories = require('../../../lib/plugins/helper/list_categories').bind(ctx);

  before(() => hexo.init().then(() => Post.insert([
    {source: 'foo', slug: 'foo'},
    {source: 'bar', slug: 'bar'},
    {source: 'baz', slug: 'baz'},
    {source: 'boo', slug: 'boo'},
    {source: 'bat', slug: 'bat'}
  ])).then(posts => Promise.each([
    ['baz'],
    ['baz', 'bar'],
    ['foo'],
    ['baz'],
    ['bat', ['baz', 'bar']]
  ], (cats, i) => posts[i].setCategories(cats))).then(() => {
    hexo.locals.invalidate();
    ctx.site = hexo.locals.toObject();
    ctx.page = ctx.site.posts.data[1];
  }));

  it('default', () => {
    var result = listCategories();

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
    var result = listCategories(Category.find({
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
    var result = listCategories({
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
    var result = listCategories({
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
    var result = listCategories({
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
    var result = listCategories({
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
    var result = listCategories({
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
    var result = listCategories({
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
    var result = listCategories({
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
    var result = listCategories({
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
    var result = listCategories({
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
    var result = listCategories({
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
    var result = listCategories({
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

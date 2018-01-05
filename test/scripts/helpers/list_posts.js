var should = require('chai').should(); // eslint-disable-line

describe('list_posts', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);
  var Post = hexo.model('Post');

  var ctx = {
    config: hexo.config
  };

  ctx.url_for = require('../../../lib/plugins/helper/url_for').bind(ctx);

  var listPosts = require('../../../lib/plugins/helper/list_posts').bind(ctx);

  hexo.config.permalink = ':title/';

  before(() => hexo.init().then(() => Post.insert([
    {source: 'foo', slug: 'foo', title: 'Its', date: 1e8},
    {source: 'bar', slug: 'bar', title: 'Chemistry', date: 1e8 + 1},
    {source: 'baz', slug: 'baz', title: 'Bitch', date: 1e8 - 1}
  ])).then(() => {
    hexo.locals.invalidate();
    ctx.site = hexo.locals.toObject();
  }));

  it('default', () => {
    var result = listPosts();

    result.should.eql([
      '<ul class="post-list">',
      '<li class="post-list-item"><a class="post-list-link" href="/bar/">Chemistry</a></li>',
      '<li class="post-list-item"><a class="post-list-link" href="/foo/">Its</a></li>',
      '<li class="post-list-item"><a class="post-list-link" href="/baz/">Bitch</a></li>',
      '</ul>'
    ].join(''));
  });

  it('specified collection', () => {
    var result = listPosts(Post.find({
      title: 'Its'
    }));

    result.should.eql([
      '<ul class="post-list">',
      '<li class="post-list-item"><a class="post-list-link" href="/foo/">Its</a></li>',
      '</ul>'
    ].join(''));
  });

  it('style: false', () => {
    var result = listPosts({
      style: false
    });

    result.should.eql([
      '<a class="post-link" href="/bar/">Chemistry</a>',
      '<a class="post-link" href="/foo/">Its</a>',
      '<a class="post-link" href="/baz/">Bitch</a>'
    ].join(', '));
  });

  it('orderby', () => {
    var result = listPosts({
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
    var result = listPosts({
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
    var result = listPosts({
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
    var result = listPosts({
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
    var result = listPosts({
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
    var result = listPosts({
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

'use strict';

var should = require('chai').should(); // eslint-disable-line
var Promise = require('bluebird');

describe('list_tags', function() {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);
  var Post = hexo.model('Post');
  var Tag = hexo.model('Tag');

  var ctx = {
    config: hexo.config
  };

  ctx.url_for = require('../../../lib/plugins/helper/url_for').bind(ctx);

  var listTags = require('../../../lib/plugins/helper/list_tags').bind(ctx);

  before(function() {
    return hexo.init().then(function() {
      return Post.insert([
        {source: 'foo', slug: 'foo'},
        {source: 'bar', slug: 'bar'},
        {source: 'baz', slug: 'baz'},
        {source: 'boo', slug: 'boo'}
      ]);
    }).then(function(posts) {
      // TODO: Warehouse needs to add a mutex lock when writing data to avoid data sync problem
      return Promise.each([
        ['foo'],
        ['baz'],
        ['baz'],
        ['bar']
      ], function(tags, i) {
        return posts[i].setTags(tags);
      });
    }).then(function() {
      hexo.locals.invalidate();
      ctx.site = hexo.locals.toObject();
    });
  });

  it('default', function() {
    var result = listTags();

    result.should.eql([
      '<ul class="tag-list">',
        '<li class="tag-list-item"><a class="tag-list-link" href="/tags/bar/">bar</a><span class="tag-list-count">1</span></li>',
        '<li class="tag-list-item"><a class="tag-list-link" href="/tags/baz/">baz</a><span class="tag-list-count">2</span></li>',
        '<li class="tag-list-item"><a class="tag-list-link" href="/tags/foo/">foo</a><span class="tag-list-count">1</span></li>',
      '</ul>'
    ].join(''));
  });

  it('specified collection', function() {
    var result = listTags(Tag.find({
      name: /^b/
    }));

    result.should.eql([
      '<ul class="tag-list">',
        '<li class="tag-list-item"><a class="tag-list-link" href="/tags/bar/">bar</a><span class="tag-list-count">1</span></li>',
        '<li class="tag-list-item"><a class="tag-list-link" href="/tags/baz/">baz</a><span class="tag-list-count">2</span></li>',
      '</ul>'
    ].join(''));
  });

  it('style: false', function() {
    var result = listTags({
      style: false
    });

    result.should.eql([
      '<a class="tag-link" href="/tags/bar/">bar<span class="tag-count">1</span></a>',
      '<a class="tag-link" href="/tags/baz/">baz<span class="tag-count">2</span></a>',
      '<a class="tag-link" href="/tags/foo/">foo<span class="tag-count">1</span></a>'
    ].join(', '));
  });

  it('show_count: false', function() {
    var result = listTags({
      show_count: false
    });

    result.should.eql([
      '<ul class="tag-list">',
        '<li class="tag-list-item"><a class="tag-list-link" href="/tags/bar/">bar</a></li>',
        '<li class="tag-list-item"><a class="tag-list-link" href="/tags/baz/">baz</a></li>',
        '<li class="tag-list-item"><a class="tag-list-link" href="/tags/foo/">foo</a></li>',
      '</ul>'
    ].join(''));
  });

  it('class', function() {
    var result = listTags({
      class: 'test'
    });

    result.should.eql([
      '<ul class="test-list">',
        '<li class="test-list-item"><a class="test-list-link" href="/tags/bar/">bar</a><span class="test-list-count">1</span></li>',
        '<li class="test-list-item"><a class="test-list-link" href="/tags/baz/">baz</a><span class="test-list-count">2</span></li>',
        '<li class="test-list-item"><a class="test-list-link" href="/tags/foo/">foo</a><span class="test-list-count">1</span></li>',
      '</ul>'
    ].join(''));
  });

  it('orderby', function() {
    var result = listTags({
      orderby: 'length'
    });

    result.should.eql([
      '<ul class="tag-list">',
        '<li class="tag-list-item"><a class="tag-list-link" href="/tags/foo/">foo</a><span class="tag-list-count">1</span></li>',
        '<li class="tag-list-item"><a class="tag-list-link" href="/tags/bar/">bar</a><span class="tag-list-count">1</span></li>',
        '<li class="tag-list-item"><a class="tag-list-link" href="/tags/baz/">baz</a><span class="tag-list-count">2</span></li>',
      '</ul>'
    ].join(''));
  });

  it('order', function() {
    var result = listTags({
      order: -1
    });

    result.should.eql([
      '<ul class="tag-list">',
        '<li class="tag-list-item"><a class="tag-list-link" href="/tags/foo/">foo</a><span class="tag-list-count">1</span></li>',
        '<li class="tag-list-item"><a class="tag-list-link" href="/tags/baz/">baz</a><span class="tag-list-count">2</span></li>',
        '<li class="tag-list-item"><a class="tag-list-link" href="/tags/bar/">bar</a><span class="tag-list-count">1</span></li>',
      '</ul>'
    ].join(''));
  });

  it('transform', function() {
    var result = listTags({
      transform: function(name) {
        return name.toUpperCase();
      }
    });

    result.should.eql([
      '<ul class="tag-list">',
        '<li class="tag-list-item"><a class="tag-list-link" href="/tags/bar/">BAR</a><span class="tag-list-count">1</span></li>',
        '<li class="tag-list-item"><a class="tag-list-link" href="/tags/baz/">BAZ</a><span class="tag-list-count">2</span></li>',
        '<li class="tag-list-item"><a class="tag-list-link" href="/tags/foo/">FOO</a><span class="tag-list-count">1</span></li>',
      '</ul>'
    ].join(''));
  });

  it('separator', function() {
    var result = listTags({
      style: false,
      separator: ''
    });

    result.should.eql([
      '<a class="tag-link" href="/tags/bar/">bar<span class="tag-count">1</span></a>',
      '<a class="tag-link" href="/tags/baz/">baz<span class="tag-count">2</span></a>',
      '<a class="tag-link" href="/tags/foo/">foo<span class="tag-count">1</span></a>'
    ].join(''));
  });

  it('amount', function() {
    var result = listTags({
      amount: 2
    });

    result.should.eql([
      '<ul class="tag-list">',
        '<li class="tag-list-item"><a class="tag-list-link" href="/tags/bar/">bar</a><span class="tag-list-count">1</span></li>',
        '<li class="tag-list-item"><a class="tag-list-link" href="/tags/baz/">baz</a><span class="tag-list-count">2</span></li>',
      '</ul>'
    ].join(''));
  });
});

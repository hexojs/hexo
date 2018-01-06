var should = require('chai').should(); // eslint-disable-line

describe('list_archives', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);
  var Post = hexo.model('Post');

  var ctx = {
    config: hexo.config,
    page: {}
  };

  ctx.url_for = require('../../../lib/plugins/helper/url_for').bind(ctx);

  var listArchives = require('../../../lib/plugins/helper/list_archives').bind(ctx);

  function resetLocals() {
    hexo.locals.invalidate();
    ctx.site = hexo.locals.toObject();
  }

  before(() => hexo.init().then(() => Post.insert([
    {source: 'foo', slug: 'foo', date: new Date(2014, 1, 2)},
    {source: 'bar', slug: 'bar', date: new Date(2013, 5, 6)},
    {source: 'baz', slug: 'baz', date: new Date(2013, 9, 10)},
    {source: 'boo', slug: 'boo', date: new Date(2013, 5, 8)}
  ])).then(() => {
    resetLocals();
  }));

  it('default', () => {
    var result = listArchives();

    result.should.eql([
      '<ul class="archive-list">',
      '<li class="archive-list-item"><a class="archive-list-link" href="/archives/2014/02/">February 2014</a><span class="archive-list-count">1</span></li>',
      '<li class="archive-list-item"><a class="archive-list-link" href="/archives/2013/10/">October 2013</a><span class="archive-list-count">1</span></li>',
      '<li class="archive-list-item"><a class="archive-list-link" href="/archives/2013/06/">June 2013</a><span class="archive-list-count">2</span></li>',
      '</ul>'
    ].join(''));
  });

  it('type: yearly', () => {
    var result = listArchives({
      type: 'yearly'
    });

    result.should.eql([
      '<ul class="archive-list">',
      '<li class="archive-list-item"><a class="archive-list-link" href="/archives/2014/">2014</a><span class="archive-list-count">1</span></li>',
      '<li class="archive-list-item"><a class="archive-list-link" href="/archives/2013/">2013</a><span class="archive-list-count">3</span></li>',
      '</ul>'
    ].join(''));
  });

  it('format', () => {
    var result = listArchives({
      format: 'YYYY/M'
    });

    result.should.eql([
      '<ul class="archive-list">',
      '<li class="archive-list-item"><a class="archive-list-link" href="/archives/2014/02/">2014/2</a><span class="archive-list-count">1</span></li>',
      '<li class="archive-list-item"><a class="archive-list-link" href="/archives/2013/10/">2013/10</a><span class="archive-list-count">1</span></li>',
      '<li class="archive-list-item"><a class="archive-list-link" href="/archives/2013/06/">2013/6</a><span class="archive-list-count">2</span></li>',
      '</ul>'
    ].join(''));
  });

  it('style: false', () => {
    var result = listArchives({
      style: false
    });

    result.should.eql([
      '<a class="archive-link" href="/archives/2014/02/">February 2014<span class="archive-count">1</span></a>',
      '<a class="archive-link" href="/archives/2013/10/">October 2013<span class="archive-count">1</span></a>',
      '<a class="archive-link" href="/archives/2013/06/">June 2013<span class="archive-count">2</span></a>'
    ].join(', '));
  });

  it('show_count', () => {
    var result = listArchives({
      show_count: false
    });

    result.should.eql([
      '<ul class="archive-list">',
      '<li class="archive-list-item"><a class="archive-list-link" href="/archives/2014/02/">February 2014</a></li>',
      '<li class="archive-list-item"><a class="archive-list-link" href="/archives/2013/10/">October 2013</a></li>',
      '<li class="archive-list-item"><a class="archive-list-link" href="/archives/2013/06/">June 2013</a></li>',
      '</ul>'
    ].join(''));
  });

  it('order', () => {
    var result = listArchives({
      order: 1
    });

    result.should.eql([
      '<ul class="archive-list">',
      '<li class="archive-list-item"><a class="archive-list-link" href="/archives/2013/06/">June 2013</a><span class="archive-list-count">2</span></li>',
      '<li class="archive-list-item"><a class="archive-list-link" href="/archives/2013/10/">October 2013</a><span class="archive-list-count">1</span></li>',
      '<li class="archive-list-item"><a class="archive-list-link" href="/archives/2014/02/">February 2014</a><span class="archive-list-count">1</span></li>',
      '</ul>'
    ].join(''));
  });

  it('transform', () => {
    var result = listArchives({
      transform(str) {
        return str.toUpperCase();
      }
    });

    result.should.eql([
      '<ul class="archive-list">',
      '<li class="archive-list-item"><a class="archive-list-link" href="/archives/2014/02/">FEBRUARY 2014</a><span class="archive-list-count">1</span></li>',
      '<li class="archive-list-item"><a class="archive-list-link" href="/archives/2013/10/">OCTOBER 2013</a><span class="archive-list-count">1</span></li>',
      '<li class="archive-list-item"><a class="archive-list-link" href="/archives/2013/06/">JUNE 2013</a><span class="archive-list-count">2</span></li>',
      '</ul>'
    ].join(''));
  });

  it('separator', () => {
    var result = listArchives({
      style: false,
      separator: ''
    });

    result.should.eql([
      '<a class="archive-link" href="/archives/2014/02/">February 2014<span class="archive-count">1</span></a>',
      '<a class="archive-link" href="/archives/2013/10/">October 2013<span class="archive-count">1</span></a>',
      '<a class="archive-link" href="/archives/2013/06/">June 2013<span class="archive-count">2</span></a>'
    ].join(''));
  });

  it('class', () => {
    var result = listArchives({
      class: 'test'
    });

    result.should.eql([
      '<ul class="test-list">',
      '<li class="test-list-item"><a class="test-list-link" href="/archives/2014/02/">February 2014</a><span class="test-list-count">1</span></li>',
      '<li class="test-list-item"><a class="test-list-link" href="/archives/2013/10/">October 2013</a><span class="test-list-count">1</span></li>',
      '<li class="test-list-item"><a class="test-list-link" href="/archives/2013/06/">June 2013</a><span class="test-list-count">2</span></li>',
      '</ul>'
    ].join(''));
  });

  it('page.lang', () => {
    ctx.page.lang = 'zh-tw';
    var result = listArchives();
    ctx.page.lang = '';

    result.should.eql([
      '<ul class="archive-list">',
      '<li class="archive-list-item"><a class="archive-list-link" href="/archives/2014/02/">二月 2014</a><span class="archive-list-count">1</span></li>',
      '<li class="archive-list-item"><a class="archive-list-link" href="/archives/2013/10/">十月 2013</a><span class="archive-list-count">1</span></li>',
      '<li class="archive-list-item"><a class="archive-list-link" href="/archives/2013/06/">六月 2013</a><span class="archive-list-count">2</span></li>',
      '</ul>'
    ].join(''));
  });

  it('config.language', () => {
    ctx.config.language = 'de';
    var result = listArchives();
    ctx.config.language = '';

    result.should.eql([
      '<ul class="archive-list">',
      '<li class="archive-list-item"><a class="archive-list-link" href="/archives/2014/02/">Februar 2014</a><span class="archive-list-count">1</span></li>',
      '<li class="archive-list-item"><a class="archive-list-link" href="/archives/2013/10/">Oktober 2013</a><span class="archive-list-count">1</span></li>',
      '<li class="archive-list-item"><a class="archive-list-link" href="/archives/2013/06/">Juni 2013</a><span class="archive-list-count">2</span></li>',
      '</ul>'
    ].join(''));
  });

  it('timezone');
});

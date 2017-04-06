var should = require('chai').should(); // eslint-disable-line

describe('paginator', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);

  var ctx = {
    page: {
      base: '',
      total: 10
    },
    site: hexo.locals,
    config: hexo.config
  };

  ctx.url_for = require('../../../lib/plugins/helper/url_for').bind(ctx);

  var paginator = require('../../../lib/plugins/helper/paginator').bind(ctx);

  function link(i) {
    return ctx.url_for(i === 1 ? '' : 'page/' + i + '/');
  }

  function checkResult(result, data) {
    var expected = '';
    var current = data.current;
    var total = data.total;
    var pages = data.pages;
    var space = data.space || '&hellip;';
    var prevNext = data.hasOwnProperty('prev_next') ? data.prev_next : true;
    var num;

    if (prevNext && current > 1) {
      expected += '<a class="extend prev" rel="prev" href="' + link(current - 1) + '">Prev</a>';
    }

    for (var i = 0, len = pages.length; i < len; i++) {
      num = pages[i];

      if (!num) {
        expected += '<span class="space">' + space + '</span>';
      } else if (num === current) {
        expected += '<span class="page-number current">' + current + '</span>';
      } else {
        expected += '<a class="page-number" href="' + link(num) + '">' + num + '</a>';
      }
    }

    if (prevNext && current < total) {
      expected += '<a class="extend next" rel="next" href="' + link(current + 1) + '">Next</a>';
    }

    result.should.eql(expected);
  }

  [
    [1, 2, 3, 0, 10],
    [1, 2, 3, 4, 0, 10],
    [1, 2, 3, 4, 5, 0, 10],
    [1, 2, 3, 4, 5, 6, 0, 10],
    [1, 0, 3, 4, 5, 6, 7, 0, 10],
    [1, 0, 4, 5, 6, 7, 8, 0, 10],
    [1, 0, 5, 6, 7, 8, 9, 10],
    [1, 0, 6, 7, 8, 9, 10],
    [1, 0, 7, 8, 9, 10],
    [1, 0, 8, 9, 10]
  ].forEach((pages, i, arr) => {
    var current = i + 1;
    var total = arr.length;

    it('current = ' + current, () => {
      var result = paginator({
        current,
        total
      });

      checkResult(result, {
        current,
        total,
        pages
      });
    });
  });

  it('show_all', () => {
    var result = paginator({
      current: 5,
      show_all: true
    });

    checkResult(result, {
      current: 5,
      total: 10,
      pages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    });
  });

  it('end_size', () => {
    var result = paginator({
      current: 5,
      end_size: 2
    });

    checkResult(result, {
      current: 5,
      total: 10,
      pages: [1, 2, 3, 4, 5, 6, 7, 0, 9, 10]
    });
  });

  it('end_size = 0', () => {
    var result = paginator({
      current: 5,
      end_size: 0
    });

    checkResult(result, {
      current: 5,
      total: 10,
      pages: [0, 3, 4, 5, 6, 7, 0]
    });
  });

  it('mid_size', () => {
    var result = paginator({
      current: 5,
      mid_size: 1
    });

    checkResult(result, {
      current: 5,
      total: 10,
      pages: [1, 0, 4, 5, 6, 0, 10]
    });
  });

  it('mid_size = 0', () => {
    var result = paginator({
      current: 5,
      mid_size: 0
    });

    checkResult(result, {
      current: 5,
      total: 10,
      pages: [1, 0, 5, 0, 10]
    });
  });

  it('space', () => {
    var result = paginator({
      current: 5,
      space: '~'
    });

    checkResult(result, {
      current: 5,
      total: 10,
      pages: [1, 0, 3, 4, 5, 6, 7, 0, 10],
      space: '~'
    });
  });

  it('no space', () => {
    var result = paginator({
      current: 5,
      space: ''
    });

    checkResult(result, {
      current: 5,
      total: 10,
      pages: [1, 3, 4, 5, 6, 7, 10]
    });
  });

  it('base', () => {
    var result = paginator({
      current: 1,
      base: 'archives/'
    });

    result.should.eql([
      '<span class="page-number current">1</span>',
      '<a class="page-number" href="/archives/page/2/">2</a>',
      '<a class="page-number" href="/archives/page/3/">3</a>',
      '<span class="space">&hellip;</span>',
      '<a class="page-number" href="/archives/page/10/">10</a>',
      '<a class="extend next" rel="next" href="/archives/page/2/">Next</a>'
    ].join(''));
  });

  it('format', () => {
    var result = paginator({
      current: 1,
      format: 'index-%d.html'
    });

    result.should.eql([
      '<span class="page-number current">1</span>',
      '<a class="page-number" href="/index-2.html">2</a>',
      '<a class="page-number" href="/index-3.html">3</a>',
      '<span class="space">&hellip;</span>',
      '<a class="page-number" href="/index-10.html">10</a>',
      '<a class="extend next" rel="next" href="/index-2.html">Next</a>'
    ].join(''));
  });

  it('prev_text / next_text', () => {
    var result = paginator({
      current: 2,
      prev_text: 'Newer',
      next_text: 'Older'
    });

    result.should.eql([
      '<a class="extend prev" rel="prev" href="/">Newer</a>',
      '<a class="page-number" href="/">1</a>',
      '<span class="page-number current">2</span>',
      '<a class="page-number" href="/page/3/">3</a>',
      '<a class="page-number" href="/page/4/">4</a>',
      '<span class="space">&hellip;</span>',
      '<a class="page-number" href="/page/10/">10</a>',
      '<a class="extend next" rel="next" href="/page/3/">Older</a>'
    ].join(''));
  });

  it('prev_next', () => {
    var result = paginator({
      current: 2,
      prev_next: false
    });

    result.should.eql([
      '<a class="page-number" href="/">1</a>',
      '<span class="page-number current">2</span>',
      '<a class="page-number" href="/page/3/">3</a>',
      '<a class="page-number" href="/page/4/">4</a>',
      '<span class="space">&hellip;</span>',
      '<a class="page-number" href="/page/10/">10</a>'
    ].join(''));
  });

  it('transform', () => {
    var result = paginator({
      current: 2,
      transform(page) {
        return 'Page ' + page;
      }
    });

    result.should.eql([
      '<a class="extend prev" rel="prev" href="/">Prev</a>',
      '<a class="page-number" href="/">Page 1</a>',
      '<span class="page-number current">Page 2</span>',
      '<a class="page-number" href="/page/3/">Page 3</a>',
      '<a class="page-number" href="/page/4/">Page 4</a>',
      '<span class="space">&hellip;</span>',
      '<a class="page-number" href="/page/10/">Page 10</a>',
      '<a class="extend next" rel="next" href="/page/3/">Next</a>'
    ].join(''));
  });

  it('context', () => {
    ctx.page.current = 5;
    var result = paginator({
      space: ''
    });

    checkResult(result, {
      current: 5,
      total: 10,
      pages: [1, 3, 4, 5, 6, 7, 10]
    });
  });

  it('current = 0', () => {
    ctx.page.current = 0;
    var result = paginator({});

    result.should.eql('');
  });
});

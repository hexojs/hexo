'use strict';

const { url_for } = require('hexo-util');

describe('paginator', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo(__dirname);

  const ctx = {
    page: {
      base: '',
      total: 10
    },
    site: hexo.locals,
    config: hexo.config
  };

  const paginator = require('../../../dist/plugins/helper/paginator').bind(ctx);

  function link(i) {
    return url_for.call(ctx, i === 1 ? '' : 'page/' + i + '/');
  }

  function checkResult(result, data) {
    let expected = '';
    const current = data.current;
    const total = data.total;
    const pages = data.pages;
    const space = data.space || '&hellip;';
    const prevNext = Object.prototype.hasOwnProperty.call(data, 'prev_next') ? data.prev_next : true;
    let num;

    if (prevNext && current > 1) {
      expected += '<a class="extend prev" rel="prev" href="' + link(current - 1) + '">Prev</a>';
    }

    for (let i = 0, len = pages.length; i < len; i++) {
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
    const current = i + 1;
    const total = arr.length;

    it('current = ' + current, () => {
      const result = paginator({
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
    const result = paginator({
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
    const result = paginator({
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
    const result = paginator({
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
    const result = paginator({
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
    const result = paginator({
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
    const result = paginator({
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
    const result = paginator({
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
    const result = paginator({
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
    const result = paginator({
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
    const result = paginator({
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
    const result = paginator({
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
    const result = paginator({
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
    const result = paginator({
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
    const result = paginator({});

    result.should.eql('');
  });

  it('escape', () => {
    const result = paginator({
      current: 2,
      prev_text: '<foo>',
      next_text: '<bar>',
      escape: false
    });

    result.should.eql([
      '<a class="extend prev" rel="prev" href="/">',
      '<foo></a>',
      '<a class="page-number" href="/">1</a>',
      '<span class="page-number current">2</span>',
      '<a class="page-number" href="/page/3/">3</a>',
      '<a class="page-number" href="/page/4/">4</a>',
      '<span class="space">&hellip;</span>',
      '<a class="page-number" href="/page/10/">10</a>',
      '<a class="extend next" rel="next" href="/page/3/">',
      '<bar></a>'
    ].join(''));
  });

  it('custom_class', () => {
    const result = paginator({
      current: 2,
      current_class: 'current-class',
      space_class: 'space-class',
      page_class: 'page-class',
      prev_class: 'prev-class',
      next_class: 'next-class'
    });

    result.should.eql([
      '<a class="prev-class" rel="prev" href="/">Prev</a>',
      '<a class="page-class" href="/">1</a>',
      '<span class="page-class current-class">2</span>',
      '<a class="page-class" href="/page/3/">3</a>',
      '<a class="page-class" href="/page/4/">4</a>',
      '<span class="space-class">&hellip;</span>',
      '<a class="page-class" href="/page/10/">10</a>',
      '<a class="next-class" rel="next" href="/page/3/">Next</a>'
    ].join(''));
  });

  it('force_prev_next', () => {
    const result = paginator({
      current: 1,
      force_prev_next: true
    });

    result.should.eql([
      '<span class="extend prev" rel="prev">Prev</span>',
      '<span class="page-number current">1</span>',
      '<a class="page-number" href="/page/2/">2</a>',
      '<a class="page-number" href="/page/3/">3</a>',
      '<span class="space">&hellip;</span>',
      '<a class="page-number" href="/page/10/">10</a>',
      '<a class="extend next" rel="next" href="/page/2/">Next</a>'
    ].join(''));
  });

  it('force_prev_next - 2', () => {
    const result = paginator({
      current: 1,
      prev_next: false,
      force_prev_next: true
    });

    result.should.eql([
      '<span class="extend prev" rel="prev">Prev</span>',
      '<span class="page-number current">1</span>',
      '<a class="page-number" href="/page/2/">2</a>',
      '<a class="page-number" href="/page/3/">3</a>',
      '<span class="space">&hellip;</span>',
      '<a class="page-number" href="/page/10/">10</a>',
      '<span class="extend next" rel="next">Next</span>'
    ].join(''));
  });
});

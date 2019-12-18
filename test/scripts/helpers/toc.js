'use strict';

describe('toc', () => {
  const toc = require('../../../lib/plugins/helper/toc');

  const html = [
    '<h1 id="title_1">Title 1</h1>',
    '<h2 id="title_1_1">Title 1.1</h2>',
    '<h3 id="title_1_1_1">Title 1.1.1</h3>',
    '<h2 id="title_1_2">Title 1.2</h2>',
    '<h2 id="title_1_3">Title 1.3</h2>',
    '<h3 id="title_1_3_1">Title 1.3.1</h3>',
    '<h1 id="title_2">Title 2</h1>',
    '<h2 id="title_2_1">Title 2.1</h2>',
    '<h1 id="title_3">Title should escape &amp;, &lt;, &#39;, and &quot;</h1>',
    '<h1 id="title_4"><a name="chapter1">Chapter 1 should be printed to toc</a></h1>'
  ].join('');

  it('default', () => {
    const className = 'toc';
    const expected = [
      '<ol class="' + className + '">',
      '<li class="' + className + '-item ' + className + '-level-1">',
      '<a class="' + className + '-link" href="#title_1">',
      '<span class="' + className + '-number">1.</span> ', // list_number enabled
      '<span class="' + className + '-text">Title 1</span>',
      '</a>',
      '<ol class="' + className + '-child">',
      '<li class="' + className + '-item ' + className + '-level-2">',
      '<a class="' + className + '-link" href="#title_1_1">',
      '<span class="' + className + '-number">1.1.</span> ', // list_number enabled
      '<span class="' + className + '-text">Title 1.1</span>',
      '</a>',
      '<ol class="' + className + '-child">',
      '<li class="' + className + '-item ' + className + '-level-3">',
      '<a class="' + className + '-link" href="#title_1_1_1">',
      '<span class="' + className + '-number">1.1.1.</span> ', // list_number enabled
      '<span class="' + className + '-text">Title 1.1.1</span>',
      '</a>',
      '</li>',
      '</ol>',
      '</li>',
      '<li class="' + className + '-item ' + className + '-level-2">',
      '<a class="' + className + '-link" href="#title_1_2">',
      '<span class="' + className + '-number">1.2.</span> ', // list_number enabled
      '<span class="' + className + '-text">Title 1.2</span>',
      '</a>',
      '</li>',
      '<li class="' + className + '-item ' + className + '-level-2">',
      '<a class="' + className + '-link" href="#title_1_3">',
      '<span class="' + className + '-number">1.3.</span> ', // list_number enabled
      '<span class="' + className + '-text">Title 1.3</span>',
      '</a>',
      '<ol class="' + className + '-child">',
      '<li class="' + className + '-item ' + className + '-level-3">',
      '<a class="' + className + '-link" href="#title_1_3_1">',
      '<span class="' + className + '-number">1.3.1.</span> ', // list_number enabled
      '<span class="' + className + '-text">Title 1.3.1</span>',
      '</a>',
      '</li>',
      '</ol>',
      '</li>',
      '</ol>',
      '</li>',
      '<li class="' + className + '-item ' + className + '-level-1">',
      '<a class="' + className + '-link" href="#title_2">',
      '<span class="' + className + '-number">2.</span> ', // list_number enabled
      '<span class="' + className + '-text">Title 2</span>',
      '</a>',
      '<ol class="' + className + '-child">',
      '<li class="' + className + '-item ' + className + '-level-2">',
      '<a class="' + className + '-link" href="#title_2_1">',
      '<span class="' + className + '-number">2.1.</span> ', // list_number enabled
      '<span class="' + className + '-text">Title 2.1</span>',
      '</a>',
      '</li>',
      '</ol>',
      '</li>',
      '<li class="' + className + '-item ' + className + '-level-1">',
      '<a class="' + className + '-link" href="#title_3">',
      '<span class="' + className + '-number">3.</span> ', // list_number enabled
      '<span class="' + className + '-text">Title should escape &amp;, &lt;, &#39;, and &quot;</span>',
      '</a>',
      '</li>',
      '<li class="' + className + '-item ' + className + '-level-1">',
      '<a class="' + className + '-link" href="#title_4">',
      '<span class="' + className + '-number">4.</span> ', // list_number enabled
      '<span class="' + className + '-text">Chapter 1 should be printed to toc</span>',
      '</a>',
      '</li>',
      '</ol>'
    ].join('');

    toc(html).should.eql(expected);
  });

  it('class', () => {
    const className = 'foo';
    const expected = [
      '<ol class="' + className + '">',
      '<li class="' + className + '-item ' + className + '-level-1">',
      '<a class="' + className + '-link" href="#title_1">',
      '<span class="' + className + '-number">1.</span> ', // list_number enabled
      '<span class="' + className + '-text">Title 1</span>',
      '</a>',
      '<ol class="' + className + '-child">',
      '<li class="' + className + '-item ' + className + '-level-2">',
      '<a class="' + className + '-link" href="#title_1_1">',
      '<span class="' + className + '-number">1.1.</span> ', // list_number enabled
      '<span class="' + className + '-text">Title 1.1</span>',
      '</a>',
      '<ol class="' + className + '-child">',
      '<li class="' + className + '-item ' + className + '-level-3">',
      '<a class="' + className + '-link" href="#title_1_1_1">',
      '<span class="' + className + '-number">1.1.1.</span> ', // list_number enabled
      '<span class="' + className + '-text">Title 1.1.1</span>',
      '</a>',
      '</li>',
      '</ol>',
      '</li>',
      '<li class="' + className + '-item ' + className + '-level-2">',
      '<a class="' + className + '-link" href="#title_1_2">',
      '<span class="' + className + '-number">1.2.</span> ', // list_number enabled
      '<span class="' + className + '-text">Title 1.2</span>',
      '</a>',
      '</li>',
      '<li class="' + className + '-item ' + className + '-level-2">',
      '<a class="' + className + '-link" href="#title_1_3">',
      '<span class="' + className + '-number">1.3.</span> ', // list_number enabled
      '<span class="' + className + '-text">Title 1.3</span>',
      '</a>',
      '<ol class="' + className + '-child">',
      '<li class="' + className + '-item ' + className + '-level-3">',
      '<a class="' + className + '-link" href="#title_1_3_1">',
      '<span class="' + className + '-number">1.3.1.</span> ', // list_number enabled
      '<span class="' + className + '-text">Title 1.3.1</span>',
      '</a>',
      '</li>',
      '</ol>',
      '</li>',
      '</ol>',
      '</li>',
      '<li class="' + className + '-item ' + className + '-level-1">',
      '<a class="' + className + '-link" href="#title_2">',
      '<span class="' + className + '-number">2.</span> ', // list_number enabled
      '<span class="' + className + '-text">Title 2</span>',
      '</a>',
      '<ol class="' + className + '-child">',
      '<li class="' + className + '-item ' + className + '-level-2">',
      '<a class="' + className + '-link" href="#title_2_1">',
      '<span class="' + className + '-number">2.1.</span> ', // list_number enabled
      '<span class="' + className + '-text">Title 2.1</span>',
      '</a>',
      '</li>',
      '</ol>',
      '</li>',
      '<li class="' + className + '-item ' + className + '-level-1">',
      '<a class="' + className + '-link" href="#title_3">',
      '<span class="' + className + '-number">3.</span> ', // list_number enabled
      '<span class="' + className + '-text">Title should escape &amp;, &lt;, &#39;, and &quot;</span>',
      '</a>',
      '</li>',
      '<li class="' + className + '-item ' + className + '-level-1">',
      '<a class="' + className + '-link" href="#title_4">',
      '<span class="' + className + '-number">4.</span> ', // list_number enabled
      '<span class="' + className + '-text">Chapter 1 should be printed to toc</span>',
      '</a>',
      '</li>',
      '</ol>'
    ].join('');

    toc(html, { class: 'foo' }).should.eql(expected);
  });

  it('list_number', () => {
    const className = 'toc';
    const expected = [
      '<ol class="' + className + '">',
      '<li class="' + className + '-item ' + className + '-level-1">',
      '<a class="' + className + '-link" href="#title_1">',
      // '<span class="' + className + '-number">1.</span> ',
      '<span class="' + className + '-text">Title 1</span>',
      '</a>',
      '<ol class="' + className + '-child">',
      '<li class="' + className + '-item ' + className + '-level-2">',
      '<a class="' + className + '-link" href="#title_1_1">',
      // '<span class="' + className + '-number">1.1.</span> ',
      '<span class="' + className + '-text">Title 1.1</span>',
      '</a>',
      '<ol class="' + className + '-child">',
      '<li class="' + className + '-item ' + className + '-level-3">',
      '<a class="' + className + '-link" href="#title_1_1_1">',
      // '<span class="' + className + '-number">1.1.1.</span> ',
      '<span class="' + className + '-text">Title 1.1.1</span>',
      '</a>',
      '</li>',
      '</ol>',
      '</li>',
      '<li class="' + className + '-item ' + className + '-level-2">',
      '<a class="' + className + '-link" href="#title_1_2">',
      // '<span class="' + className + '-number">1.2.</span> ',
      '<span class="' + className + '-text">Title 1.2</span>',
      '</a>',
      '</li>',
      '<li class="' + className + '-item ' + className + '-level-2">',
      '<a class="' + className + '-link" href="#title_1_3">',
      // '<span class="' + className + '-number">1.3.</span> ',
      '<span class="' + className + '-text">Title 1.3</span>',
      '</a>',
      '<ol class="' + className + '-child">',
      '<li class="' + className + '-item ' + className + '-level-3">',
      '<a class="' + className + '-link" href="#title_1_3_1">',
      // '<span class="' + className + '-number">1.3.1.</span> ',
      '<span class="' + className + '-text">Title 1.3.1</span>',
      '</a>',
      '</li>',
      '</ol>',
      '</li>',
      '</ol>',
      '</li>',
      '<li class="' + className + '-item ' + className + '-level-1">',
      '<a class="' + className + '-link" href="#title_2">',
      // '<span class="' + className + '-number">2.</span> ',
      '<span class="' + className + '-text">Title 2</span>',
      '</a>',
      '<ol class="' + className + '-child">',
      '<li class="' + className + '-item ' + className + '-level-2">',
      '<a class="' + className + '-link" href="#title_2_1">',
      // '<span class="' + className + '-number">2.1.</span> ',
      '<span class="' + className + '-text">Title 2.1</span>',
      '</a>',
      '</li>',
      '</ol>',
      '</li>',
      '<li class="' + className + '-item ' + className + '-level-1">',
      '<a class="' + className + '-link" href="#title_3">',
      // '<span class="' + className + '-number">3.</span> ',
      '<span class="' + className + '-text">Title should escape &amp;, &lt;, &#39;, and &quot;</span>',
      '</a>',
      '</li>',
      '<li class="' + className + '-item ' + className + '-level-1">',
      '<a class="' + className + '-link" href="#title_4">',
      // '<span class="' + className + '-number">4.</span> ',
      '<span class="' + className + '-text">Chapter 1 should be printed to toc</span>',
      '</a>',
      '</li>',
      '</ol>'
    ].join('');

    toc(html, { list_number: false }).should.eql(expected);
  });

  it('max_depth', () => {
    const className = 'toc';
    const expected = [
      '<ol class="' + className + '">',
      '<li class="' + className + '-item ' + className + '-level-1">',
      '<a class="' + className + '-link" href="#title_1">',
      '<span class="' + className + '-number">1.</span> ',
      '<span class="' + className + '-text">Title 1</span>',
      '</a>',
      '<ol class="' + className + '-child">',
      '<li class="' + className + '-item ' + className + '-level-2">',
      '<a class="' + className + '-link" href="#title_1_1">',
      '<span class="' + className + '-number">1.1.</span> ',
      '<span class="' + className + '-text">Title 1.1</span>',
      '</a>',
      '</li>',
      '<li class="' + className + '-item ' + className + '-level-2">',
      '<a class="' + className + '-link" href="#title_1_2">',
      '<span class="' + className + '-number">1.2.</span> ',
      '<span class="' + className + '-text">Title 1.2</span>',
      '</a>',
      '</li>',
      '<li class="' + className + '-item ' + className + '-level-2">',
      '<a class="' + className + '-link" href="#title_1_3">',
      '<span class="' + className + '-number">1.3.</span> ',
      '<span class="' + className + '-text">Title 1.3</span>',
      '</a>',
      '</li>',
      '</ol>',
      '</li>',
      '<li class="' + className + '-item ' + className + '-level-1">',
      '<a class="' + className + '-link" href="#title_2">',
      '<span class="' + className + '-number">2.</span> ',
      '<span class="' + className + '-text">Title 2</span>',
      '</a>',
      '<ol class="' + className + '-child">',
      '<li class="' + className + '-item ' + className + '-level-2">',
      '<a class="' + className + '-link" href="#title_2_1">',
      '<span class="' + className + '-number">2.1.</span> ',
      '<span class="' + className + '-text">Title 2.1</span>',
      '</a>',
      '</li>',
      '</ol>',
      '</li>',
      '<li class="' + className + '-item ' + className + '-level-1">',
      '<a class="' + className + '-link" href="#title_3">',
      '<span class="' + className + '-number">3.</span> ',
      '<span class="' + className + '-text">Title should escape &amp;, &lt;, &#39;, and &quot;</span>',
      '</a>',
      '</li>',
      '<li class="' + className + '-item ' + className + '-level-1">',
      '<a class="' + className + '-link" href="#title_4">',
      '<span class="' + className + '-number">4.</span> ',
      '<span class="' + className + '-text">Chapter 1 should be printed to toc</span>',
      '</a>',
      '</li>',
      '</ol>'
    ].join('');

    toc(html, { max_depth: 2 }).should.eql(expected);
  });
});

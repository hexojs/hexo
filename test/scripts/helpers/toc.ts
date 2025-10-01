import { escapeHTML } from 'hexo-util';
import toc from '../../../lib/plugins/helper/toc';

describe('toc', () => {
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

  it('min_depth', () => {
    const className = 'toc';
    const expected = [
      '<ol class="' + className + '">',
      '<li class="' + className + '-item toc-level-2">',
      '<a class="' + className + '-link" href="#title_1_1">',
      '<span class="' + className + '-number">1.</span> ',
      '<span class="' + className + '-text">Title 1.1</span>',
      '</a>',
      '<ol class="' + className + '-child">',
      '<li class="' + className + '-item toc-level-3">',
      '<a class="' + className + '-link" href="#title_1_1_1">',
      '<span class="' + className + '-number">1.1.</span> ',
      '<span class="' + className + '-text">Title 1.1.1</span>',
      '</a>',
      '</li>',
      '</ol>',
      '</li>',
      '<li class="' + className + '-item toc-level-2">',
      '<a class="' + className + '-link" href="#title_1_2">',
      '<span class="' + className + '-number">2.</span> ',
      '<span class="' + className + '-text">Title 1.2</span>',
      '</a>',
      '</li>',
      '<li class="' + className + '-item toc-level-2">',
      '<a class="' + className + '-link" href="#title_1_3">',
      '<span class="' + className + '-number">3.</span> ',
      '<span class="' + className + '-text">Title 1.3</span>',
      '</a>',
      '<ol class="' + className + '-child">',
      '<li class="' + className + '-item toc-level-3">',
      '<a class="' + className + '-link" href="#title_1_3_1">',
      '<span class="' + className + '-number">3.1.</span> ',
      '<span class="' + className + '-text">Title 1.3.1</span>',
      '</a>',
      '</li>',
      '</ol>',
      '</li>',
      '<li class="' + className + '-item toc-level-2">',
      '<a class="' + className + '-link" href="#title_2_1">',
      '<span class="' + className + '-number">4.</span> ',
      '<span class="' + className + '-text">Title 2.1</span>',
      '</a>',
      '</li>',
      '</ol>'
    ].join('');

    toc(html, { min_depth: 2 }).should.eql(expected);
  });

  it('No id attribute', () => {
    const className = 'f';
    const input = [
      '<h1>foo</h1>',
      '<h1 id="">bar</h1>'
    ].join('');

    const expected = [
      `<ol class="${className}">`,
      `<li class="${className}-item ${className}-level-1">`,
      `<a class="${className}-link"><span class="${className}-text">foo</span></a>`,
      '</li>',
      `<li class="${className}-item ${className}-level-1">`,
      `<a class="${className}-link"><span class="${className}-text">bar</span></a>`,
      '</li></ol>'
    ].join('');

    toc(input, { list_number: false, class: className }).should.eql(expected);
  });

  it('non-ASCII id', () => {
    const className = 'f';
    const zh = '这是-H1-标题';
    const zhs = zh.replace(/-/g, ' ');
    const de = 'Ich-♥-Deutsch';
    const des = de.replace(/-/g, ' ');
    const ru = 'Я-люблю-русский';
    const rus = ru.replace(/-/g, ' ');
    const special = '%20';
    const input = [
      `<h1 id="${zh}">${zhs}</h1>`,
      `<h1 id="${de}">${des}</h1>`,
      `<h1 id="${ru}">${rus}</h1>`,
      `<h1 id="${special}">${special}</h1>`
    ].join('');

    const expected = [
      `<ol class="${className}">`,
      `<li class="${className}-item ${className}-level-1">`,
      `<a class="${className}-link" href="#${encodeURI(zh)}"><span class="${className}-text">${zhs}</span></a>`,
      '</li>',
      `<li class="${className}-item ${className}-level-1">`,
      `<a class="${className}-link" href="#${encodeURI(de)}"><span class="${className}-text">${des}</span></a>`,
      '</li>',
      `<li class="${className}-item ${className}-level-1">`,
      `<a class="${className}-link" href="#${encodeURI(ru)}"><span class="${className}-text">${rus}</span></a>`,
      '</li>',
      `<li class="${className}-item ${className}-level-1">`,
      `<a class="${className}-link" href="#${encodeURI(special)}"><span class="${className}-text">${special}</span></a>`,
      '</li></ol>'
    ].join('');

    toc(input, { list_number: false, class: className }).should.eql(expected);
  });

  it('escape unsafe class name', () => {
    const className = 'f"b';
    const esClass = escapeHTML(className);
    const input = '<h1>bar</h1>';

    const expected = [
      `<ol class="${esClass}">`,
      `<li class="${esClass}-item ${esClass}-level-1">`,
      `<a class="${esClass}-link"><span class="${esClass}-text">bar</span></a>`,
      '</li></ol>'
    ].join('');

    toc(input, { list_number: false, class: className }).should.eql(expected);
  });

  it('invalid input', () => {
    const input = '<h9000>bar</h9000>';

    toc(input).should.eql('');
  });

  it('unnumbered headings', () => {
    const className = 'toc';

    const input = [
      '<h3>Title 1</h3>',
      '<h3>Title 2</h3>',
      '<h4>Title 2.1</h4>',
      '<h3 data-toc-unnumbered="true">Reference</h3>'
    ].join('');

    const expected = [
      `<ol class="${className}">`,
      `<li class="${className}-item ${className}-level-3">`,
      `<a class="${className}-link"><span class="${className}-number">1.</span> `,
      `<span class="${className}-text">Title 1</span>`,
      '</a>',
      '</li>',
      `<li class="${className}-item ${className}-level-3">`,
      `<a class="${className}-link">`,
      `<span class="${className}-number">2.</span> `,
      `<span class="${className}-text">Title 2</span>`,
      '</a>',
      `<ol class="${className}-child">`,
      `<li class="${className}-item ${className}-level-4">`,
      `<a class="${className}-link">`,
      `<span class="${className}-number">2.1.</span> `,
      `<span class="${className}-text">Title 2.1</span>`,
      '</a>',
      '</li>',
      '</ol>',
      '</li>',
      `<li class="${className}-item ${className}-level-3">`,
      `<a class="${className}-link">`,
      `<span class="${className}-text">Reference</span>`,
      '</a>',
      '</li>',
      '</ol>'
    ].join('');

    toc(input, { list_number: true, class: className }).should.eql(expected);
  });

  it('custom class', () => {
    const className = 'foo';
    const childClassName = 'bar';
    const expected = [
      '<ol class="' + className + '">',
      '<li class="' + className + '-item ' + className + '-level-1">',
      '<a class="' + className + '-link" href="#title_1">',
      '<span class="' + className + '-number">1.</span> ', // list_number enabled
      '<span class="' + className + '-text">Title 1</span>',
      '</a>',
      '<ol class="' + childClassName + '">',
      '<li class="' + className + '-item ' + className + '-level-2">',
      '<a class="' + className + '-link" href="#title_1_1">',
      '<span class="' + className + '-number">1.1.</span> ', // list_number enabled
      '<span class="' + className + '-text">Title 1.1</span>',
      '</a>',
      '<ol class="' + childClassName + '">',
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
      '<ol class="' + childClassName + '">',
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
      '<ol class="' + childClassName + '">',
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

    toc(html, { class: 'foo', class_child: 'bar' }).should.eql(expected);
  });

  it('max_items - result contains only h1 items', () => {
    const className = 'toc';
    const expected = [
      '<ol class="' + className + '">',
      '<li class="' + className + '-item ' + className + '-level-1">',
      '<a class="' + className + '-link" href="#title_1">',
      '<span class="' + className + '-number">1.</span> ', // list_number enabled
      '<span class="' + className + '-text">Title 1</span>',
      '</a>',
      // '<ol class="' + className + '-child">',
      // <!-- h2 is truncated -->
      // '</ol>',
      '</li>',
      '<li class="' + className + '-item ' + className + '-level-1">',
      '<a class="' + className + '-link" href="#title_2">',
      '<span class="' + className + '-number">2.</span> ', // list_number enabled
      '<span class="' + className + '-text">Title 2</span>',
      '</a>',
      // '<ol class="' + className + '-child">',
      // <!-- h2 is truncated -->
      // '</ol>',
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

    toc(html, { max_items: 4}).should.eql(expected); // The number of `h1` is 4
    toc(html, { max_items: 7}).should.eql(expected); // Maximum number 7 cannot display up to `h2`
  });

  it('max_items - result contains h1 and h2 items', () => {
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
      // '<ol class="' + className + '-child">',
      // <!-- h3 is truncated -->
      // '</ol>',
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
      // '<ol class="' + className + '-child">',
      // <!-- h3 is truncated -->
      // '</ol>',
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

    toc(html, { max_items: 8}).should.eql(expected); // Maximum number 8 can display up to `h2`
    toc(html, { max_items: 9}).should.eql(expected); // Maximum number 10 is required to display up to `h3`
  });

  it('max_items - result of h1 was truncated', () => {
    const className = 'toc';
    const expected = [
      '<ol class="' + className + '">',
      '<li class="' + className + '-item ' + className + '-level-1">',
      '<a class="' + className + '-link" href="#title_1">',
      '<span class="' + className + '-number">1.</span> ', // list_number enabled
      '<span class="' + className + '-text">Title 1</span>',
      '</a>',
      // '<ol class="' + className + '-child">',
      // <!-- h2 is truncated -->
      // '</ol>',
      '</li>',
      '<li class="' + className + '-item ' + className + '-level-1">',
      '<a class="' + className + '-link" href="#title_2">',
      '<span class="' + className + '-number">2.</span> ', // list_number enabled
      '<span class="' + className + '-text">Title 2</span>',
      '</a>',
      '</li>',
      // <!-- `h1` is truncated from the end -->
      '</ol>'
    ].join('');

    toc(html, { max_items: 2}).should.eql(expected); // `h1` is truncated from the end
  });
});

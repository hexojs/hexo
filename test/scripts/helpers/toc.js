var should = require('chai').should(); // eslint-disable-line
var _ = require('lodash');

function ifTrue(cond, yes, no) {
  return cond ? yes : no;
}

describe('toc', () => {
  var toc = require('../../../lib/plugins/helper/toc');

  var html = [
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

  var genResult = options => {
    options = _.assign({
      class: 'toc',
      list_number: true,
      max_depth: 6
    }, options);

    var className = options.class;
    var listNumber = options.list_number;
    var maxDepth = options.max_depth;

    var resultTitle_1_1_1 = [
      '<ol class="' + className + '-child">',
      '<li class="' + className + '-item ' + className + '-level-3">',
      '<a class="' + className + '-link" href="#title_1_1_1">',
      ifTrue(listNumber, '<span class="' + className + '-number">1.1.1.</span> ', ''),
      '<span class="' + className + '-text">Title 1.1.1</span>',
      '</a>',
      '</li>',
      '</ol>'
    ].join('');

    var resultTitle_1_3_1 = [
      '<ol class="' + className + '-child">',
      '<li class="' + className + '-item ' + className + '-level-3">',
      '<a class="' + className + '-link" href="#title_1_3_1">',
      ifTrue(listNumber, '<span class="' + className + '-number">1.3.1.</span> ', ''),
      '<span class="' + className + '-text">Title 1.3.1</span>',
      '</a>',
      '</li>',
      '</ol>'
    ].join('');

    var resultTitle_1_1 = [
      '<ol class="' + className + '-child">',
      '<li class="' + className + '-item ' + className + '-level-2">',
      '<a class="' + className + '-link" href="#title_1_1">',
      ifTrue(listNumber, '<span class="' + className + '-number">1.1.</span> ', ''),
      '<span class="' + className + '-text">Title 1.1</span>',
      '</a>',
      ifTrue(maxDepth >= 3, resultTitle_1_1_1, ''),
      '</li>',
      '<li class="' + className + '-item ' + className + '-level-2">',
      '<a class="' + className + '-link" href="#title_1_2">',
      ifTrue(listNumber, '<span class="' + className + '-number">1.2.</span> ', ''),
      '<span class="' + className + '-text">Title 1.2</span>',
      '</a>',
      '</li>',
      '<li class="' + className + '-item ' + className + '-level-2">',
      '<a class="' + className + '-link" href="#title_1_3">',
      ifTrue(listNumber, '<span class="' + className + '-number">1.3.</span> ', ''),
      '<span class="' + className + '-text">Title 1.3</span>',
      '</a>',
      ifTrue(maxDepth >= 3, resultTitle_1_3_1, ''),
      '</li>',
      '</ol>'
    ].join('');

    var resultTitle_2_1 = [
      '<ol class="' + className + '-child">',
      '<li class="' + className + '-item ' + className + '-level-2">',
      '<a class="' + className + '-link" href="#title_2_1">',
      ifTrue(listNumber, '<span class="' + className + '-number">2.1.</span> ', ''),
      '<span class="' + className + '-text">Title 2.1</span>',
      '</a>',
      '</li>',
      '</ol>'
    ].join('');

    var resultAllTitles_Level1 = [
      '<li class="' + className + '-item ' + className + '-level-1">',
      '<a class="' + className + '-link" href="#title_1">',
      ifTrue(listNumber, '<span class="' + className + '-number">1.</span> ', ''),
      '<span class="' + className + '-text">Title 1</span>',
      '</a>',
      ifTrue(maxDepth >= 2, resultTitle_1_1, ''),
      '</li>',
      '<li class="' + className + '-item ' + className + '-level-1">',
      '<a class="' + className + '-link" href="#title_2">',
      ifTrue(listNumber, '<span class="' + className + '-number">2.</span> ', ''),
      '<span class="' + className + '-text">Title 2</span>',
      '</a>',
      ifTrue(maxDepth >= 2, resultTitle_2_1, ''),
      '</li>',
      '<li class="' + className + '-item ' + className + '-level-1">',
      '<a class="' + className + '-link" href="#title_3">',
      ifTrue(listNumber, '<span class="' + className + '-number">3.</span> ', ''),
      '<span class="' + className + '-text">Title should escape &amp;, &lt;, &#39;, and &quot;</span>',
      '</a>',
      '</li>',
      '<li class="' + className + '-item ' + className + '-level-1">',
      '<a class="' + className + '-link" href="#title_4">',
      ifTrue(listNumber, '<span class="' + className + '-number">4.</span> ', ''),
      '<span class="' + className + '-text">Chapter 1 should be printed to toc</span>',
      '</a>',
      '</li>'
    ].join('');

    var result = [
      '<ol class="' + className + '">',
      ifTrue(maxDepth >= 1, resultAllTitles_Level1, ''),
      '</ol>'
    ].join('');

    return result;
  };

  it('default', () => {
    genResult().should.eql(toc(html));
  });

  it('class', () => {
    var options = {
      class: 'foo'
    };

    genResult(options).should.eql(toc(html, options));
  });

  it('list_number', () => {
    var options = {
      list_number: false
    };

    genResult(options).should.eql(toc(html, options));
  });

  it('max_depth', () => {
    var options = {
      max_depth: 2
    };

    genResult(options).should.eql(toc(html, options));
  });
});

'use strict';

const { highlight } = require('hexo-util');

const code = [
  'if tired && night:',
  '  sleep()'
].join('\n');

exports.content = [
  '# Title',
  '``` python',
  code,
  '```',
  'some content',
  '',
  '## Another title',
  '{% blockquote %}',
  'quote content 1',
  '{% endblockquote %}',
  '',
  '{% quote Hello World %}',
  'quote content 2',
  '{% endquote %}'
].join('\n');

exports.expected = [
  '<h1 id="Title"><a href="#Title" class="headerlink" title="Title"></a>Title</h1>',
  highlight(code, {lang: 'python'}),
  '\n<p>some content</p>\n',
  '<h2 id="Another-title"><a href="#Another-title" class="headerlink" title="Another title"></a>Another title</h2>',
  '<blockquote>',
  '<p>quote content 1</p>\n',
  '</blockquote>\n\n',
  '<blockquote><p>quote content 2</p>\n',
  '<footer><strong>Hello World</strong></footer></blockquote>'
].join('');

exports.expected_disable_nunjucks = [
  '<h1 id="Title"><a href="#Title" class="headerlink" title="Title"></a>Title</h1>',
  highlight(code, {lang: 'python'}),
  '\n<p>some content</p>\n',
  '<h2 id="Another-title"><a href="#Another-title" class="headerlink" title="Another title"></a>Another title</h2>',
  '<p>{% blockquote %}<br>',
  'quote content 1<br>',
  '{% endblockquote %}</p>\n',
  '<p>{% quote Hello World %}<br>',
  'quote content 2<br>',
  '{% endquote %}</p>'
].join('');

exports.content_for_issue_3346 = [
  '# Title',
  '```',
  '{% test1 %}',
  '{{ test2 }}',
  '```',
  'some content',
  '',
  '## Another title',
  '{% blockquote %}',
  'quote content',
  '{% endblockquote %}'
].join('\n');

exports.expected_for_issue_3346 = [
  '<h1 id="Title"><a href="#Title" class="headerlink" title="Title"></a>Title</h1>',
  highlight('{% test1 %}\n{{ test2 }}').replace(/{/g, '&#123;').replace(/}/g, '&#125;'), // Escaped by backtick_code_block
  '\n<p>some content</p>\n',
  '<h2 id="Another-title"><a href="#Another-title" class="headerlink" title="Another title"></a>Another title</h2>',
  '<blockquote>',
  '<p>quote content</p>\n',
  '</blockquote>'
].join('');

exports.content_for_issue_4460 = [
  '```html',
  '<body>',
  '<!-- here goes the rest of the page -->',
  '</body>',
  '```'
].join('\n');

'use strict';

const util = require('hexo-util');

const code = [
  'if tired && night:',
  '  sleep()'
].join('\n');

const content = [
  '# Title',
  '``` python',
  code,
  '```',
  'some content',
  '',
  '## Another title',
  '{% blockquote %}',
  'quote content',
  '{% endblockquote %}',
  '',
  '{% quote Hello World %}',
  'quote content',
  '{% endquote %}'
].join('\n');

exports.content = content;

exports.expected = [
  '<h1 id="Title"><a href="#Title" class="headerlink" title="Title"></a>Title</h1>',
  util.highlight(code, {lang: 'python'}),
  '\n\n<p>some content</p>\n',
  '<h2 id="Another-title"><a href="#Another-title" class="headerlink" title="Another title"></a>Another title</h2>',
  '<blockquote>',
  '<p>quote content</p>\n',
  '</blockquote>\n\n',
  '<blockquote><p>quote content</p>\n',
  '<footer><strong>Hello World</strong></footer></blockquote>'
].join('');

exports.expected_disable_nunjucks = [
  '<h1 id="Title"><a href="#Title" class="headerlink" title="Title"></a>Title</h1>',
  util.highlight(code, {lang: 'python'}),
  '\n\n<p>some content</p>\n',
  '<h2 id="Another-title"><a href="#Another-title" class="headerlink" title="Another title"></a>Another title</h2>',
  '<p>{% blockquote %}<br>',
  'quote content<br>',
  '{% endblockquote %}</p>\n',
  '<p>{% quote Hello World %}<br>',
  'quote content<br>',
  '{% endquote %}</p>'
].join('');

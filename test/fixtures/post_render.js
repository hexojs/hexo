'use strict';

var util = require('hexo-util');

var code = [
  'if tired && night:',
  '  sleep()'
].join('\n');

var content = [
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
  '\n<p>some content</p>\n',
  '<h2 id="Another-title"><a href="#Another-title" class="headerlink" title="Another title"></a>Another title</h2>',
  '<blockquote>',
  '<p>quote content</p>\n',
  '</blockquote>\n',
  '<blockquote><p>quote content</p>\n',
  '<footer><strong>Hello World</strong></footer></blockquote>'
].join('');

'use strict';

const { escapeHTML, stripIndent } = require('hexo-util');

const rIndentedCodeBlock = /(^|(?:^|\n)(?:(?: {0,3}>){1,3}[^\S\r\n])?[^\S\r\n]*\n)((?:((?:(?: {0,3}>){1,3}[^\S\r\n])?)( {4}|\t)([^\n]*?)(\n|$))+)/g;

function indentedCodeBlock(data) {
  data.content = data.content.replace(rIndentedCodeBlock, ($0, before, content, start, $4, $5, end) => {

    // PR #3765
    if (start.includes('>')) {
      const depth = start.split('>').length - 1;
      const regexp = new RegExp(`^( {0,3}>){0,${depth}}([^\\S\\r\\n]|$)`, 'mg');
      content = content.replace(regexp, '');
    }

    const escapedContent = escapeHTML(stripIndent(content))
      .replace(/{/g, '&#123;')
      .replace(/}/g, '&#125;');

    const wrappedContent = `<pre><code>${escapedContent}</code></pre>`;

    const guardedContent = '<!--hexoPostRenderEscape:'
        + wrappedContent.replace(/^/mg, start) // hack to guard blank lines from incorrect rendering
        + ':hexoPostRenderEscape-->';

    return `${before}${start}${guardedContent}${end}`;
  });
}

module.exports = indentedCodeBlock;

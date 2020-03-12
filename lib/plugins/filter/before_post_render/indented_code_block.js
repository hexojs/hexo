'use strict';

const { escapeHTML, stripIndent } = require('hexo-util');

const rIndentedCodeBlock = /^(?:((?:(?: {0,3}>){1,3}[^\S\r\n])?)( {4}|\t)([^\n]*?)(\n|$))+/gm;

function indentedCodeBlock(data) {
  data.content = data.content.replace(rIndentedCodeBlock, (content, start, $2, $3, end) => {

    // PR #3765
    if (start.includes('>')) {
      const depth = start.split('>').length - 1;
      const regexp = new RegExp(`^( {0,3}>){0,${depth}}([^\\S\\r\\n]|$)`, 'mg');
      const paddingOnEnd = ' '; // complement uncaptured whitespaces at last line
      content = (content + paddingOnEnd).replace(regexp, '').replace(/\n$/, '');
    }

    const escapedContent = escapeHTML(stripIndent(content))
      .replace(/{/g, '&#123;')
      .replace(/}/g, '&#125;');

    const wrappedContent = `<pre><code>${escapedContent}</code></pre>`;

    return `${start}<!--hexoPostRenderEscape:${wrappedContent}:hexoPostRenderEscape-->${end}`;
  });
}

module.exports = indentedCodeBlock;

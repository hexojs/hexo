'use strict';

const { escapeHTML, stripIndent } = require('hexo-util');

const rIndentedCodeBlock = /(^|(?:^|\n)(?:(?: {0,3}>){1,3}[^\S\r\n])?[^\S\r\n]*)((?:(?:^|\n)((?:(?: {0,3}>){1,3}[^\S\r\n])?)( {4}|\t)([^\n]*))+)(?=\n|$)/g;

function indentedCodeBlock(data) {
  data.content = data.content.replace(rIndentedCodeBlock, ($0, before, content, start, $4, $5) => {

    content = content.replace(/^\n/, x => {
      before = before + '\n';
      return '';
    });

    // PR #3765
    if (start.includes('>')) {
      const depth = start.split('>').length - 1;
      const regexp = new RegExp(`^( {0,3}>){0,${depth}}([^\\S\\r\\n]|$)`, 'mg');
      content = content.replace(regexp, '');
    }

    const escapedContent = escapeHTML(stripIndent(content))
      .replace(/{/g, '&#123;')
      .replace(/}/g, '&#125;');

    // hack to guard blank lines from incorrect rendering
    const guardedContent = escapedContent.replace(/^/mg, start).replace(start, '');

    const wrappedContent = `<pre><code>${guardedContent}</code></pre>`;

    const markedContent = '<!--hexoPostRenderEscape:' + wrappedContent + ':hexoPostRenderEscape-->';

    return `${before}${start}${markedContent}\n`;
  });
}

module.exports = indentedCodeBlock;

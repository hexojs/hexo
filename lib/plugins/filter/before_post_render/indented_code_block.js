'use strict';

const stripIndent = require('strip-indent');
const { highlight } = require('hexo-util');

const rIndentedCodeBlock = /^(?:((?:(?: {0,3}>){1,3}[^\S\r\n])?)( {4}|\t)([^\n]*?)(\n|$))+/gm;

function indentedCodeBlock(data) {
  const config = this.config.highlight || {};
  data.content = data.content.replace(rIndentedCodeBlock, (content, start, $2, $3, end) => {
    const options = {
      hljs: config.hljs,
      autoDetect: config.auto_detect,
      gutter: config.line_number,
      tab: config.tab_replace,
      wrap: config.wrap
    };

    // PR #3765
    if (start.includes('>')) {
      const depth = start.split('>').length - 1;
      const regexp = new RegExp(`^( {0,3}>){0,${depth}}([^\\S\\r\\n]|$)`, 'mg');
      const paddingOnEnd = ' '; // complement uncaptured whitespaces at last line
      content = (content + paddingOnEnd).replace(regexp, '').replace(/\n$/, '');
    }

    content = stripIndent(content);

    if (config.enable) {
      content = highlight(content, options);
    } else {
      content = `<pre><code>${content}</code></pre>`;
    }

    content = content
      .replace(/{/g, '&#123;')
      .replace(/}/g, '&#125;');

    return `${start}<!--hexoPostRenderEscape:${content}:hexoPostRenderEscape-->${end}`;
  });
}

module.exports = indentedCodeBlock;

'use strict';

const stripIndent = require('strip-indent');
const { highlight } = require('hexo-util');

const rBacktick = /(\s*)(`{3,}|~{3,}) *(.*) *\n([\s\S]+?)\s*\2(\n+|$)/g;
const rAllOptions = /([^\s]+)\s+(.+?)\s+(https?:\/\/\S+|\/\S+)\s*(.+)?/;
const rLangCaption = /([^\s]+)\s*(.+)?/;

function backtickCodeBlock(data) {
  const config = this.config.highlight || {};
  if (!config.enable) return;
  data.content = data.content.replace(rBacktick, function() {
    const start = arguments[1];
    const end = arguments[5];
    const args = arguments[3].split('=').shift();
    let content = arguments[4];

    const options = {
      hljs: config.hljs,
      autoDetect: config.auto_detect,
      gutter: config.line_number,
      tab: config.tab_replace
    };

    if (options.gutter) {
      config.first_line_number = config.first_line_number || 'always1';
      if (config.first_line_number === 'inline') {

        // setup line number by inline
        arguments[3] = arguments[3].replace('=+', '=');
        options.gutter = arguments[3].includes('=');

        // setup fiestLineNumber;
        options.firstLine = options.gutter ? arguments[3].split('=')[1] || 1 : 0;
      }
    }

    if (args) {
      let match;

      if (rAllOptions.test(args)) {
        match = args.match(rAllOptions);
      } else if (rLangCaption.test(args)) {
        match = args.match(rLangCaption);
      }

      if (match) {
        options.lang = match[1];

        if (match[2]) {
          options.caption = `<span>${match[2]}</span>`;

          if (match[3]) {
            options.caption += `<a href="${match[3]}">${match[4] ? match[4] : 'link'}</a>`;
          }
        }
      }
    }

    content = highlight(stripIndent(content), options)
      .replace(/{/g, '&#123;')
      .replace(/}/g, '&#125;');

    return `${start}<escape>${content}</escape>${end ? '\n\n' : ''}`;
  });
}

module.exports = backtickCodeBlock;

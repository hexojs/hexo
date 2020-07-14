'use strict';

// Based on: https://raw.github.com/imathis/octopress/master/plugins/code_block.rb

const { escapeHTML } = require('hexo-util');

// Lazy require highlight.js & prismjs
let highlight, prismHighlight;

const rCaptionUrlTitle = /(\S[\S\s]*)\s+(https?:\/\/\S+)\s+(.+)/i;
const rCaptionUrl = /(\S[\S\s]*)\s+(https?:\/\/\S+)/i;
const rCaption = /\S[\S\s]*/;

/**
 * Code block tag
 * Syntax:
 * {% codeblock [options] %}
 * code snippet
 * {% endcodeblock %}
 * @param {String} title Caption text
 * @param {Object} lang Specify language
 * @param {String} url Source link
 * @param {String} link_text Text of the link
 * @param {Object} line_number Show line number, value must be a boolean
 * @param {Object} highlight Enable code highlighting, value must be a boolean
 * @param {Object} first_line Specify the first line number, value must be a number
 * @param {Object} mark Line highlight specific line(s), each value separated by a comma. Specify number range using a dash
 * Example: `mark:1,4-7,10` will mark line 1, 4 to 7 and 10.
 * @param {Object} wrap Wrap the code block in <table>, value must be a boolean
 * @returns {String} Code snippet with code highlighting
*/

function parseArgs(args) {
  const _else = [];
  const len = args.length;
  let lang,
    line_number, wrap;
  let firstLine = 1;
  const mark = [];
  for (let i = 0; i < len; i++) {
    const colon = args[i].indexOf(':');

    if (colon === -1) {
      _else.push(args[i]);
      continue;
    }

    const key = args[i].slice(0, colon);
    const value = args[i].slice(colon + 1);

    switch (key) {
      case 'lang':
        lang = value;
        break;
      case 'line_number':
        line_number = value === 'true';
        break;
      case 'first_line':
        if (!isNaN(value)) firstLine = +value;
        break;
      case 'wrap':
        wrap = value === 'true';
        break;
      case 'mark': {
        for (const cur of value.split(',')) {
          const hyphen = cur.indexOf('-');
          if (hyphen !== -1) {
            let a = +cur.substr(0, hyphen);
            let b = +cur.substr(hyphen + 1);
            if (Number.isNaN(a) || Number.isNaN(b)) continue;
            if (b < a) { // switch a & b
              const temp = a;
              a = b;
              b = temp;
            }

            for (; a <= b; a++) {
              mark.push(a);
            }
          }
          if (!isNaN(cur)) mark.push(+cur);
        }
        break;
      }
      default: {
        _else.push(args[i]);
      }
    }
  }

  const arg = _else.join(' ');
  // eslint-disable-next-line one-var
  let match, caption = '';

  if ((match = arg.match(rCaptionUrlTitle)) != null) {
    caption = `<span>${match[1]}</span><a href="${match[2]}">${match[3]}</a>`;
  } else if ((match = arg.match(rCaptionUrl)) != null) {
    caption = `<span>${match[1]}</span><a href="${match[2]}">link</a>`;
  } else if ((match = arg.match(rCaption)) != null) {
    caption = `<span>${match[0]}</span>`;
  }

  return {
    lang,
    firstLine,
    caption,
    line_number,
    mark,
    wrap
  };
}

module.exports = ctx => function codeTag(args, content) {
  const hljsCfg = ctx.config.highlight || {};
  const prismjsCfg = ctx.config.prismjs || {};

  // If neither highlight.js nor prism.js is enabled, return escaped code directly
  if (!hljsCfg.enable && !prismjsCfg.enable) {
    return `<pre><code>${escapeHTML(content)}</code></pre>`;
  }

  let index;
  let enableHighlight = true;

  if ((index = args.findIndex(item => item.startsWith('highlight:'))) !== -1) {
    const arg = args[index];
    const highlightStr = arg.slice(10);
    enableHighlight = highlightStr === 'true';
    args.splice(index, 1);
  }

  // If 'hilight: false' is given, return escaped code directly
  if (!enableHighlight) {
    return `<pre><code>${escapeHTML(content)}</code></pre>`;
  }

  const { lang, firstLine, caption, line_number, mark, wrap } = parseArgs(args);

  if (prismjsCfg.enable) {
    const prismjsOption = {
      lang,
      firstLine,
      lineNumber: typeof line_number !== 'undefined' ? line_number : prismjsCfg.line_number,
      mark,
      tab: prismjsCfg.tab_replace,
      isPreprocess: prismjsCfg.preprocess
    };

    if (!prismHighlight) prismHighlight = require('hexo-util').prismHighlight;

    content = prismHighlight(content, prismjsOption);
  } else {
    const hljsOption = {
      lang: typeof lang !== 'undefined' ? lang : '',
      firstLine,
      caption,
      gutter: typeof line_number !== 'undefined' ? line_number : hljsCfg.line_number,
      hljs: hljsCfg.hljs,
      mark,
      tab: hljsCfg.tab_replace,
      autoDetect: hljsCfg.auto_detect,
      wrap: typeof wrap === 'boolean' ? wrap : hljsCfg.wrap
    };

    if (!highlight) highlight = require('hexo-util').highlight;

    content = highlight(content, hljsOption);
  }

  return content.replace(/{/g, '&#123;').replace(/}/g, '&#125;');
};

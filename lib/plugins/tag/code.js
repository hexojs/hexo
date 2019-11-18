'use strict';

// Based on: https://raw.github.com/imathis/octopress/master/plugins/code_block.rb

const { escapeHTML, highlight } = require('hexo-util');
const stripIndent = require('strip-indent');

const rCaptionUrlTitle = /(\S[\S\s]*)\s+(https?:\/\/)(\S+)\s+(.+)/i;
const rCaptionUrl = /(\S[\S\s]*)\s+(https?:\/\/)(\S+)/i;
const rCaption = /(\S[\S\s]*)/;
const rLang = /\s*lang:(\w+)/i;
const rLineNumber = /\s*line_number:(\w+)/i;
const rHighlight = /\s*highlight:(\w+)/i;
const rFirstLine = /\s*first_line:(\d+)/i;
const rMark = /\s*mark:([0-9,-]+)/i;
const rWrap = /\s*wrap:(\w+)/i;

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

function getHighlightOptions(config, arg) {

  let lang = '';
  if (rLang.test(arg)) {
    arg = arg.replace(rLang, (match, _lang) => {
      lang = _lang;
      return '';
    });
  }

  let line_number = config.line_number;
  if (rLineNumber.test(arg)) {
    arg = arg.replace(rLineNumber, (match, _line_number) => {
      line_number = _line_number === 'true';
      return '';
    });
  }

  let first_line = 1;
  if (rFirstLine.test(arg)) {
    arg = arg.replace(rFirstLine, (match, _first_line) => {
      first_line = _first_line;
      return '';
    });
  }

  let wrap = config.wrap;
  if (rWrap.test(arg)) {
    arg = arg.replace(rWrap, (match, _wrap) => {
      wrap = _wrap === 'true';
      return '';
    });
  }

  let mark = [];
  if (rMark.test(arg)) {
    arg = arg.replace(rMark, (match, _mark) => {
      mark = _mark.split(',').reduce((prev, cur) => {
        if (/-/.test(cur)) {
          let a = Number(cur.substr(0, cur.indexOf('-')));
          let b = Number(cur.substr(cur.indexOf('-') + 1));
          if (b < a) { // switch a & b
            const temp = a;
            a = b;
            b = temp;
          }

          for (; a <= b; a++) {
            prev.push(a);
          }

          return prev;
        }

        prev.push(Number(cur));
        return prev;
      }, []);

      return '';
    });
  }

  let caption = '';
  if (rCaptionUrlTitle.test(arg)) {
    const match = arg.match(rCaptionUrlTitle);
    caption = `<span>${match[1]}</span><a href="${match[2]}${match[3]}">${match[4]}</a>`;
  } else if (rCaptionUrl.test(arg)) {
    const match = arg.match(rCaptionUrl);
    caption = `<span>${match[1]}</span><a href="${match[2]}${match[3]}">link</a>`;
  } else if (rCaption.test(arg)) {
    const match = arg.match(rCaption);
    caption = `<span>${match[1]}</span>`;
  }

  return {
    lang,
    firstLine: first_line,
    caption,
    gutter: line_number,
    hljs: config.hljs,
    mark,
    tab: config.tab_replace,
    autoDetect: config.auto_detect,
    wrap
  };
}

module.exports = ctx => function codeTag(args, content) {
  let arg = args.join(' ');
  const config = ctx.config.highlight || {};
  let enable = config.enable;

  if (rHighlight.test(arg)) {
    arg = arg.replace(rHighlight, (match, _enable) => {
      enable = _enable === 'true';
      return '';
    });
  }

  if (!enable) {
    content = escapeHTML(content);
    return `<pre><code>${content}</code></pre>`;
  }

  content = stripIndent(content);

  content = highlight(content, getHighlightOptions(config, arg));

  content = content.replace(/{/g, '&#123;')
    .replace(/}/g, '&#125;');

  return content;
};

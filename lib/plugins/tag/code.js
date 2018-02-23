'use strict';

// Based on: https://raw.github.com/imathis/octopress/master/plugins/code_block.rb

const util = require('hexo-util');
const escapeHTML = util.escapeHTML;
const highlight = util.highlight;
const stripIndent = require('strip-indent');

const rCaptionUrlTitle = /(\S[\S\s]*)\s+(https?:\/\/)(\S+)\s+(.+)/i;
const rCaptionUrl = /(\S[\S\s]*)\s+(https?:\/\/)(\S+)/i;
const rCaption = /(\S[\S\s]*)/;
const rLang = /\s*lang:(\w+)/i;
const rLineNumber = /\s*line_number:(\w+)/i;
const rHighlight = /\s*highlight:(\w+)/i;
const rFirstLine = /\s*first_line:(\d+)/i;
const rMark = /\s*mark:([0-9,-]+)/i;

/**
 * Code block tag
 *
 * Syntax:
 *   {% codeblock [title] [lang:language] [url] [link text] [line_number:(true|false)] [highlight:(true|false)] [first_line:number] [mark:#,#-#] %}
 *   code snippet
 *   {% endcodeblock %}
 */

module.exports = ctx => function codeTag(args, content) {
  let arg = args.join(' ');
  const config = ctx.config.highlight || {};
  let enable = config.enable;

  if (rHighlight.test(arg)) {
    arg = arg.replace(rHighlight, function() {
      enable = arguments[1] === 'true';
      return '';
    });
  }

  if (!enable) {
    content = escapeHTML(content);
    return `<pre><code>${content}</code></pre>`;
  }

  let caption = '';
  let lang = '';
  let line_number = config.line_number;
  let first_line = 1;
  let mark = [];
  let match;

  if (rLang.test(arg)) {
    arg = arg.replace(rLang, function() {
      lang = arguments[1];
      return '';
    });
  }

  if (rLineNumber.test(arg)) {
    arg = arg.replace(rLineNumber, function() {
      line_number = arguments[1] === 'true';
      return '';
    });
  }

  if (rFirstLine.test(arg)) {
    arg = arg.replace(rFirstLine, function() {
      first_line = arguments[1];
      return '';
    });
  }

  if (rMark.test(arg)) {
    arg = arg.replace(rMark, function() {
      mark = arguments[1].split(',').reduce(function getMarkedLines(prev, cur) {
        let a, b, temp;
        if (/-/.test(cur)) {
          a = Number(cur.substr(0, cur.indexOf('-')));
          b = Number(cur.substr(cur.indexOf('-') + 1));
          if (b < a) { // switch a & b
            temp = a; a = b; b = temp;
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

  if (rCaptionUrlTitle.test(arg)) {
    match = arg.match(rCaptionUrlTitle);
    caption = `<span>${match[1]}</span><a href="${match[2]}${match[3]}">${match[4]}</a>`;
  } else if (rCaptionUrl.test(arg)) {
    match = arg.match(rCaptionUrl);
    caption = `<span>${match[1]}</span><a href="${match[2]}${match[3]}">link</a>`;
  } else if (rCaption.test(arg)) {
    match = arg.match(rCaption);
    caption = `<span>${match[1]}</span>`;
  }

  content = stripIndent(content);

  content = highlight(content, {
    lang,
    firstLine: first_line,
    caption,
    gutter: line_number,
    hljs: config.hljs,
    mark,
    tab: config.tab_replace,
    autoDetect: config.auto_detect
  });

  content = content.replace(/{/g, '&#123;')
    .replace(/}/g, '&#125;');

  return content;
};

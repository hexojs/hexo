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

/**
 * Code block tag
 *
 * Syntax:
 *   {% codeblock [title] [lang:language] [url] [link text] [line_number:(true|false)] [highlight:(true|false)] [first_line:number] [mark:#,#-#] %}
 *   code snippet
 *   {% endcodeblock %}
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

  let mark = [];
  if (rMark.test(arg)) {
    arg = arg.replace(rMark, (match, _mark) => {
      mark = _mark.split(',').reduce(function getMarkedLines(prev, cur) {
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
    autoDetect: config.auto_detect
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

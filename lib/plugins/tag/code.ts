// Based on: https://raw.github.com/imathis/octopress/master/plugins/code_block.rb

import { escapeHTML } from 'hexo-util';
import type Hexo from '../../hexo';
import type { HighlightOptions } from '../../extend/syntax_highlight';

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

function parseArgs(args: string[]): HighlightOptions {
  const _else = [];
  const len = args.length;
  let lang, language_attr,
    line_number, line_threshold, wrap;
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
      case 'line_threshold':
        if (!isNaN(Number(value))) line_threshold = +value;
        break;
      case 'first_line':
        if (!isNaN(Number(value))) firstLine = +value;
        break;
      case 'wrap':
        wrap = value === 'true';
        break;
      case 'mark': {
        for (const cur of value.split(',')) {
          const hyphen = cur.indexOf('-');
          if (hyphen !== -1) {
            let a = +cur.slice(0, hyphen);
            let b = +cur.slice(hyphen + 1);
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
          if (!isNaN(Number(cur))) mark.push(+cur);
        }
        break;
      }
      case 'language_attr': {
        language_attr = value === 'true';
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
    language_attr,
    firstLine,
    caption,
    line_number,
    line_threshold,
    mark,
    wrap
  };
}

export = (ctx: Hexo) => function codeTag(args: string[], content: string) {

  // If neither highlight.js nor prism.js is enabled, return escaped code directly
  if (!ctx.extend.highlight.query(ctx.config.syntax_highlighter)) {
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

  // If 'highlight: false' is given, return escaped code directly
  if (!enableHighlight) {
    return `<pre><code>${escapeHTML(content)}</code></pre>`;
  }

  const options = parseArgs(args);
  options.lines_length = content.split('\n').length;
  content = ctx.extend.highlight.exec(ctx.config.syntax_highlighter, {
    context: ctx,
    args: [content, options]
  });

  return content.replace(/{/g, '&#123;').replace(/}/g, '&#125;');
};

import type { HighlightOptions } from '../../../extend/syntax_highlight';
import type Hexo from '../../../hexo';
import { scanPostSegments } from '../../../hexo/post_render_lexer';
import type { RenderData } from '../../../types';

const rAllOptions = /([^\s]+)\s+(.+?)\s+(https?:\/\/\S+|\/\S+)\s*(.+)?/;
const rLangCaption = /([^\s]+)\s*(.+)?/;
const rAdditionalOptions = /\s((?:line_number|line_threshold|first_line|wrap|mark|language_attr|highlight):\S+)/g;

const escapeSwigTag = (str: string) => str.replace(/{/g, '&#123;').replace(/}/g, '&#125;');

function parseArgs(args: string) {
  const matches = [];

  let match: RegExpExecArray | null, language_attr: boolean,
    line_number: boolean, line_threshold: number, wrap: boolean;
  let enableHighlight = true;
  while ((match = rAdditionalOptions.exec(args)) !== null) {
    matches.push(match[1]);
  }

  const len = matches.length;
  const mark: number[] = [];
  let firstLine = 1;
  for (let i = 0; i < len; i++) {
    const [key, value] = matches[i].split(':');

    switch (key) {
      case 'highlight':
        enableHighlight = value === 'true';
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
              [a, b] = [b, a];
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
    }
  }
  return {
    options: {
      language_attr,
      firstLine,
      line_number,
      line_threshold,
      mark,
      wrap
    },
    enableHighlight,
    _args: args.replace(rAdditionalOptions, '')
  };
}

export = (ctx: Hexo): (data: RenderData) => void => {
  return function backtickCodeBlock(data: RenderData): void {
    const dataContent = data.content;

    if ((!dataContent.includes('```') && !dataContent.includes('~~~')) || !ctx.extend.highlight.query(ctx.config.syntax_highlighter)) return;
    data.content = scanPostSegments(dataContent).map(segment => {
      const source = dataContent.slice(segment.start, segment.end);
      if (segment.type !== 'fenced-code' || !segment.closed) return source;

      let content = dataContent.slice(segment.contentStart, segment.contentEnd).replace(/\r?\n$/, '');
      let args = segment.info;
      const parsedArgs = parseArgs(args);
      if (!parsedArgs.enableHighlight) return escapeSwigTag(source);
      args = parsedArgs._args;

      // Extract language and caption of code blocks
      const langArgs = args.split('=').shift();
      let lang: string, caption: string;

      if (langArgs) {
        const match = rAllOptions.exec(langArgs) || rLangCaption.exec(langArgs);

        if (match) {
          lang = match[1];

          if (match[2]) {
            caption = `<span>${match[2]}</span>`;

            if (match[3]) {
              caption += `<a href="${match[3]}">${match[4] ? match[4] : 'link'}</a>`;
            }
          }
        }
      }

      // PR #3765
      if (segment.prefix.includes('>')) {
        const depth = segment.prefix.split('>').length - 1;
        const regexp = new RegExp(`^([^\\S\\r\\n]*>){0,${depth}}([^\\S\\r\\n]|$)`, 'mg');
        content = content.replace(regexp, '');
      }

      const options: HighlightOptions = {
        lang,
        caption,
        lines_length: content.split('\n').length,
        ...parsedArgs.options
      };
      // setup line number by inline
      args = args.replace('=+', '=');

      // setup firstLineNumber;
      if (args.includes('=')) {
        options.firstLineNumber = args.split('=')[1] || 1;
      }
      content = ctx.extend.highlight.exec(ctx.config.syntax_highlighter, {
        context: ctx,
        args: [content, options]
      });

      return segment.prefix
        + '<hexoPostRenderCodeBlock>'
        + escapeSwigTag(content)
        + '</hexoPostRenderCodeBlock>'
        + dataContent.slice(segment.closingEnd, segment.end);
    }).join('');
  };
};

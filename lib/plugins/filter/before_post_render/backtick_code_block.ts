import type Hexo from '../../../hexo';
import type { RenderData } from '../../../types';
import assert from 'assert';

const rBacktick = /^((?:[^\S\r\n]*>){0,3}[^\S\r\n]*)(`{3,}|~{3,})[^\S\r\n]*((?:.*?[^`\s])?)[^\S\r\n]*\n((?:[\s\S]*?\n)?)(?:(?:[^\S\r\n]*>){0,3}[^\S\r\n]*)\2[^\S\r\n]?(\n+|$)/gm;
const rAllOptions = /([^\s]+)\s+(.+?)\s+(https?:\/\/\S+|\/\S+)\s*(.+)?/;
const rLangCaption = /([^\s]+)\s*(.+)?/;
const rCommentEscape = /(<!--[\s\S]*?-->)/g;
const rCommentHolder = /(?:<|&lt;)!--comment\uFFFC(\d+)--(?:>|&gt;)/g;

const escapeSwigTag = (str: string) => str.replace(/{/g, '&#123;').replace(/}/g, '&#125;');

interface Options {
  lang: string,
  caption: string,
  lines_length: number,
  firstLineNumber?: string | number
}

class CodeBlockEscape {
  public stored: string[];

  constructor() {
    this.stored = [];
  }

  static escapeContent(cache: string[], flag: string, str: string) {
    return `<!--${flag}\uFFFC${cache.push(str) - 1}-->`;
  }

  static restoreContent(cache: string[]) {
    return (_: string, index: number) => {
      assert(cache[index]);
      const value = cache[index];
      cache[index] = null;
      return value;
    };
  }

  restoreComments(str: string) {
    return str.replace(rCommentHolder, CodeBlockEscape.restoreContent(this.stored));
  }

  escapeComments(str: string) {
    return str.replace(rCommentEscape, (_, content) => CodeBlockEscape.escapeContent(this.stored, 'comment', content));
  }

}

export = (ctx: Hexo): (data: RenderData) => void => {
  return function backtickCodeBlock(data: RenderData): void {
    const dataContent = data.content;

    if ((!dataContent.includes('```') && !dataContent.includes('~~~')) || !ctx.extend.highlight.query(ctx.config.syntax_highlighter)) return;
    const cacheObj = new CodeBlockEscape();
    data.content = cacheObj.escapeComments(data.content);
    data.content = data.content.replace(rBacktick, ($0, start, $2, _args, _content, end) => {
      let content = _content.replace(/\n$/, '');

      // neither highlight or prismjs is enabled, return escaped content directly.
      if (!ctx.extend.highlight.query(ctx.config.syntax_highlighter)) return escapeSwigTag($0);

      // Extract language and caption of code blocks
      const args = _args.split('=').shift();
      let lang: string, caption: string;

      if (args) {
        const match = rAllOptions.exec(args) || rLangCaption.exec(args);

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
      if (start.includes('>')) {
        // heading of last line is already removed by the top RegExp "rBacktick"
        const depth = start.split('>').length - 1;
        const regexp = new RegExp(`^([^\\S\\r\\n]*>){0,${depth}}([^\\S\\r\\n]|$)`, 'mg');
        content = content.replace(regexp, '');
      }

      const options: Options = {
        lang,
        caption,
        lines_length: content.split('\n').length
      };
      // setup line number by inline
      _args = _args.replace('=+', '=');

      // setup firstLineNumber;
      if (_args.includes('=')) {
        options.firstLineNumber = _args.split('=')[1] || 1;
      }
      content = ctx.extend.highlight.exec(ctx.config.syntax_highlighter, {
        context: ctx,
        args: [content, options]
      });

      return start
        + '<hexoPostRenderCodeBlock>'
        + escapeSwigTag(content)
        + '</hexoPostRenderCodeBlock>'
        + end;
    });
    data.content = cacheObj.restoreComments(data.content);
  };
};

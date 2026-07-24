import assert from 'assert';
import type { HighlightOptions } from '../extend/syntax_highlight';
import type Hexo from './index';
import {
  BLOCK_START,
  COMMENT_START,
  type FencedCodeSegment,
  VARIABLE_START,
  pairNunjucksBlocks,
  scanNunjucks,
  scanPostSegments
} from './post_render_lexer';

const rSwigPlaceHolder = /(?:<|&lt;)!--swig\uFFFC(\d+)--(?:>|&gt;)/g;
const rCodeBlockPlaceHolder = /(?:<|&lt;)!--code\uFFFC(\d+)--(?:>|&gt;)/g;
const rCommentHolder = /(?:<|&lt;)!--comment\uFFFC(\d+)--(?:>|&gt;)/g;
const rContextHolder = /hexoPostRenderContext\uFFFC(\d+)\uFFFC/g;

const rAllOptions = /([^\s]+)\s+(.+?)\s+(https?:\/\/\S+|\/\S+)\s*(.+)?/;
const rLangCaption = /([^\s]+)\s*(.+)?/;
const rAdditionalOptions = /\s((?:line_number|line_threshold|first_line|wrap|mark|language_attr|highlight):\S+)/g;

const escapeCodeBraces = (str: string) => str.replace(/{/g, '&#123;').replace(/}/g, '&#125;');
const hasNunjucksSyntax = (str: string) => str.includes(VARIABLE_START)
  || str.includes(BLOCK_START)
  || str.includes(COMMENT_START);

function parseArgs(args: string) {
  const matches = [];

  let match: RegExpExecArray | null, language_attr: boolean,
    line_number: boolean, line_threshold: number, wrap: boolean;
  let enableHighlight = true;
  while ((match = rAdditionalOptions.exec(args)) !== null) {
    matches.push(match[1]);
  }

  const mark: number[] = [];
  let firstLine = 1;
  for (const option of matches) {
    const [key, value] = option.split(':');

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
            if (b < a) [a, b] = [b, a];

            for (; a <= b; a++) mark.push(a);
          }
          if (!isNaN(Number(cur))) mark.push(+cur);
        }
        break;
      }
      case 'language_attr':
        language_attr = value === 'true';
        break;
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
    args: args.replace(rAdditionalOptions, '')
  };
}

class PostRenderProcessor {
  private readonly codeBlocks: Array<string | null> = [];
  private readonly comments: Array<string | null> = [];
  private readonly swig: Array<string | null> = [];
  public hasNunjucks = false;

  constructor(private readonly ctx: Hexo) {}

  private static escapeContent(cache: Array<string | null>, flag: string, str: string) {
    return `<!--${flag}\uFFFC${cache.push(str) - 1}-->`;
  }

  private static restoreContent(cache: Array<string | null>) {
    return (_: string, index: string) => {
      const value = cache[Number(index)];
      assert(value != null);
      cache[Number(index)] = null;
      return value;
    };
  }

  restoreAllSwigTags(str: string) {
    return str.replace(rSwigPlaceHolder, PostRenderProcessor.restoreContent(this.swig));
  }

  restoreCodeBlocks(str: string) {
    return str.replace(rCodeBlockPlaceHolder, PostRenderProcessor.restoreContent(this.codeBlocks));
  }

  restoreComments(str: string) {
    return str.replace(rCommentHolder, PostRenderProcessor.restoreContent(this.comments));
  }

  private escapeCodeBlock(str: string) {
    // Keep the historical HTML output while code remains hidden from Nunjucks.
    return PostRenderProcessor.escapeContent(this.codeBlocks, 'code', escapeCodeBraces(str));
  }

  private protectMarkdownCode(str: string) {
    if (!hasNunjucksSyntax(str)) return str;

    return str.replace(/[{}]/g, brace => PostRenderProcessor.escapeContent(
      this.codeBlocks,
      'code',
      brace === '{' ? '&#123;' : '&#125;'
    ));
  }

  private prepareInlineCode(str: string) {
    const tokens = scanNunjucks(str);
    if (tokens.length === 0) return str;

    this.hasNunjucks = true;
    const pairs = pairNunjucksBlocks(tokens);
    let output = '';
    let cursor = 0;

    tokens.forEach((token, index) => {
      if (token.start < cursor || token.type !== 'block' || token.name !== 'raw') return;
      const closingIndex = pairs.get(index);
      if (closingIndex == null) return;

      const closing = tokens[closingIndex];
      output += str.slice(cursor, token.start);
      output += this.escapeSwig(str.slice(token.start, closing.end));
      cursor = closing.end;
    });

    return output + str.slice(cursor);
  }

  private escapeComment(str: string) {
    // Nunjucks does not reparse expression output, so this recreates the first
    // brace after rendering without evaluating the original comment contents.
    const protectedComment = str.replace(/\{(?=[{%#])/g, () => {
      this.hasNunjucks = true;
      return '{{ "{" }}';
    });
    return PostRenderProcessor.escapeContent(this.comments, 'comment', protectedComment);
  }

  private escapeSwig(str: string) {
    return PostRenderProcessor.escapeContent(this.swig, 'swig', str);
  }

  private renderFencedCode(str: string, segment: FencedCodeSegment, canHighlight: boolean) {
    if (!segment.closed || !canHighlight) return;

    const parsedArgs = parseArgs(segment.info);
    if (!parsedArgs.enableHighlight) return;

    let content = str.slice(segment.contentStart, segment.contentEnd).replace(/\r?\n$/, '');
    let args = parsedArgs.args;
    const langArgs = args.split('=').shift();
    let lang: string, caption: string;

    if (langArgs) {
      const match = rAllOptions.exec(langArgs) || rLangCaption.exec(langArgs);
      if (match) {
        lang = match[1];
        if (match[2]) {
          caption = `<span>${match[2]}</span>`;
          if (match[3]) caption += `<a href="${match[3]}">${match[4] || 'link'}</a>`;
        }
      }
    }

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
    args = args.replace('=+', '=');
    if (args.includes('=')) options.firstLineNumber = args.split('=')[1] || 1;

    content = this.ctx.extend.highlight.exec(this.ctx.config.syntax_highlighter, {
      context: this.ctx,
      args: [content, options]
    });

    return segment.prefix
      + this.escapeCodeBlock(content)
      + str.slice(segment.closingEnd, segment.end);
  }

  prepare(str: string, enableNunjucks = true) {
    const containsNunjucks = enableNunjucks && hasNunjucksSyntax(str);
    const canHighlight = (str.includes('```') || str.includes('~~~'))
      && !!this.ctx.extend.highlight.query(this.ctx.config.syntax_highlighter);
    if (!containsNunjucks && !canHighlight) return str;

    const contexts: string[] = [];
    const contextPlaceholder = (value: string) => `hexoPostRenderContext\uFFFC${contexts.push(value) - 1}\uFFFC`;
    const restoreContexts = (value: string) => value.replace(rContextHolder, (_, index) => contexts[Number(index)]);

    const contextual = scanPostSegments(str).map(segment => {
      const value = str.slice(segment.start, segment.end);
      if (segment.type === 'fenced-code') {
        const rendered = this.renderFencedCode(str, segment, canHighlight);
        if (rendered != null) return rendered;
        return containsNunjucks ? contextPlaceholder(this.protectMarkdownCode(value)) : value;
      }
      if (!containsNunjucks) return value;
      if (segment.type === 'html-comment') return this.escapeComment(value);
      if (segment.type === 'inline-code') return contextPlaceholder(this.prepareInlineCode(value));
      return value;
    }).join('');

    if (!containsNunjucks) return contextual;

    const tokens = scanNunjucks(contextual);
    if (tokens.length === 0) return restoreContexts(contextual);

    this.hasNunjucks = true;
    const pairs = pairNunjucksBlocks(tokens);
    let output = '';
    let cursor = 0;

    for (let index = 0; index < tokens.length; index++) {
      const token = tokens[index];
      if (token.start < cursor) continue;

      output += contextual.slice(cursor, token.start);
      const closingIndex = pairs.get(index);
      if (closingIndex == null) {
        output += this.escapeSwig(contextual.slice(token.start, token.end));
        cursor = token.end;
        continue;
      }

      const closing = tokens[closingIndex];
      output += this.escapeSwig(restoreContexts(contextual.slice(token.start, closing.end)));
      cursor = closing.end;
      index = closingIndex;
    }

    output += contextual.slice(cursor);
    return restoreContexts(output);
  }
}

export default PostRenderProcessor;

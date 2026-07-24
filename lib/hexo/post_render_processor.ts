import assert from 'assert';
import type { HighlightOptions } from '../extend/syntax_highlight';
import type Hexo from './index';
import {
  BLOCK_START,
  COMMENT_START,
  type FencedCodeSegment,
  type NunjucksToken,
  VARIABLE_START,
  lexPost,
  pairNunjucksBlocks
} from './post_render_lexer';

const rSwigPlaceHolder = /(?:<|&lt;)!--swig\uFFFC(\d+)--(?:>|&gt;)/g;
const rCodeBlockPlaceHolder = /(?:<|&lt;)!--code\uFFFC(\d+)--(?:>|&gt;)/g;
const rCommentHolder = /(?:<|&lt;)!--comment\uFFFC(\d+)--(?:>|&gt;)/g;

const rAllOptions = /([^\s]+)\s+(.+?)\s+(https?:\/\/\S+|\/\S+)\s*(.+)?/;
const rLangCaption = /([^\s]+)\s*(.+)?/;
const rAdditionalOptions = /\s((?:line_number|line_threshold|first_line|wrap|mark|language_attr|highlight):\S+)/g;

const escapeCodeBraces = (str: string) => str.replace(/{/g, '&#123;').replace(/}/g, '&#125;');
const hasNunjucksSyntax = (str: string) => str.includes(VARIABLE_START)
  || str.includes(BLOCK_START)
  || str.includes(COMMENT_START);

interface SourceRange {
  end: number;
  start: number;
}

interface Replacement extends SourceRange {
  value: string;
}

const applyReplacements = (str: string, range: SourceRange, replacements: Replacement[]) => {
  let output = '';
  let cursor = range.start;

  for (const replacement of replacements) {
    assert(replacement.start >= cursor && replacement.end <= range.end);
    output += str.slice(cursor, replacement.start) + replacement.value;
    cursor = replacement.end;
  }

  return output + str.slice(cursor, range.end);
};

const getSwigRanges = (tokens: NunjucksToken[]) => {
  const pairs = pairNunjucksBlocks(tokens);
  const ranges: SourceRange[] = [];

  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    const closingIndex = pairs.get(index);
    if (closingIndex == null) {
      ranges.push({ start: token.start, end: token.end });
      continue;
    }

    ranges.push({ start: token.start, end: tokens[closingIndex].end });
    index = closingIndex;
  }

  return ranges;
};

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

    const tokens = lexPost(str, enableNunjucks);
    const swigRanges = getSwigRanges(tokens.nunjucks);
    const contextReplacements: Replacement[] = [];
    let swigRangeIndex = 0;

    if (swigRanges.length > 0) this.hasNunjucks = true;

    for (const segment of tokens.segments) {
      while (swigRanges[swigRangeIndex]?.end <= segment.start) swigRangeIndex++;
      const swigRange = swigRanges[swigRangeIndex];
      const insideSwig = swigRange != null
        && swigRange.start <= segment.start
        && segment.end <= swigRange.end;
      const value = str.slice(segment.start, segment.end);
      if (segment.type === 'fenced-code') {
        const rendered = this.renderFencedCode(str, segment, canHighlight);
        if (rendered != null) {
          contextReplacements.push({ start: segment.start, end: segment.end, value: rendered });
        } else if (enableNunjucks && hasNunjucksSyntax(value)) {
          contextReplacements.push({
            start: segment.start,
            end: segment.end,
            value: this.protectMarkdownCode(value)
          });
        }
        continue;
      }

      if (!enableNunjucks) continue;
      if (segment.type === 'html-comment' && containsNunjucks) {
        contextReplacements.push({
          start: segment.start,
          end: segment.end,
          value: this.escapeComment(value)
        });
        continue;
      }

      if (segment.type === 'inline-code' && segment.nunjucks.length > 0) {
        this.hasNunjucks = true;
        if (!insideSwig && segment.rawBlocks.length > 0) {
          const rawReplacements = segment.rawBlocks.map(block => ({
            ...block,
            value: this.escapeSwig(str.slice(block.start, block.end))
          }));
          contextReplacements.push({
            start: segment.start,
            end: segment.end,
            value: applyReplacements(str, segment, rawReplacements)
          });
        }
      }
    }

    const replacements: Replacement[] = [];
    let contextIndex = 0;
    for (const swigRange of swigRanges) {
      while (contextReplacements[contextIndex]?.end <= swigRange.start) {
        replacements.push(contextReplacements[contextIndex++]);
      }

      const inner: Replacement[] = [];
      while (contextReplacements[contextIndex]?.start < swigRange.end) {
        inner.push(contextReplacements[contextIndex++]);
      }
      replacements.push({
        ...swigRange,
        value: this.escapeSwig(applyReplacements(str, swigRange, inner))
      });
    }
    replacements.push(...contextReplacements.slice(contextIndex));

    return applyReplacements(str, { start: 0, end: str.length }, replacements);
  }
}

export default PostRenderProcessor;

import assert from 'assert';

/*
 * Nunjucks delimiter handling in this file is adapted from its lexer.
 *
 * Copyright (c) 2012-2015, James Long
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES ARE DISCLAIMED. IN NO EVENT SHALL THE
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DAMAGES ARISING IN ANY
 * WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
 */

const rSwigPlaceHolder = /(?:<|&lt;)!--swig\uFFFC(\d+)--(?:>|&gt;)/g;
const rCodeBlockPlaceHolder = /(?:<|&lt;)!--code\uFFFC(\d+)--(?:>|&gt;)/g;
const rCommentHolder = /(?:<|&lt;)!--comment\uFFFC(\d+)--(?:>|&gt;)/g;
const rContextHolder = /hexoPostRenderContext\uFFFC(\d+)\uFFFC/g;

const BLOCK_START = '{%';
const BLOCK_END = '%}';
const VARIABLE_START = '{{';
const VARIABLE_END = '}}';
const COMMENT_START = '{#';
const COMMENT_END = '#}';
const NUNJUCKS_TOKEN_BOUNDARIES = ' \n\t\r\u00A0()[]{}%*-+~/#,:|.<>=!';

type SegmentType = 'text' | 'fenced-code' | 'inline-code' | 'html-comment';

interface Segment {
  end: number;
  start: number;
  type: SegmentType;
}

type NunjucksTokenType = 'block' | 'variable' | 'comment';

interface NunjucksToken {
  end: number;
  name?: string;
  start: number;
  type: NunjucksTokenType;
}

const countBackticks = (str: string, start: number) => {
  let end = start;
  while (str[end] === '`') end++;
  return end - start;
};

const isBlankLineBoundary = (str: string, index: number) => str.startsWith('\n\n', index)
  || str.startsWith('\r\n\r\n', index)
  || str.startsWith('\r\n\n', index)
  || str.startsWith('\n\r\n', index);

const rRawStart = /^\{%-?\s*raw\s*-?%\}/;
const rRawEnd = /\{%-?\s*endraw\s*-?%\}/;

const findRawBlockEnd = (str: string, start: number) => {
  const opening = rRawStart.exec(str.slice(start));
  if (!opening) return -1;

  const contentStart = start + opening[0].length;
  const closing = rRawEnd.exec(str.slice(contentStart));
  return closing ? contentStart + closing.index + closing[0].length : -1;
};

const findInlineCodeEnd = (str: string, start: number, size: number) => {
  let index = start + size;
  while (index < str.length) {
    if (isBlankLineBoundary(str, index)) return -1;
    if (str.startsWith(BLOCK_START, index)) {
      const rawEnd = findRawBlockEnd(str, index);
      if (rawEnd !== -1) {
        index = rawEnd;
        continue;
      }
    }
    if (str[index] === '`') {
      const currentSize = countBackticks(str, index);
      if (currentSize === size) return index + size;
      index += currentSize;
    } else {
      index++;
    }
  }
  return -1;
};

interface Fence {
  char: '`' | '~';
  end: number;
  size: number;
}

const findFence = (str: string, start: number): Fence | undefined => {
  if (start > 0 && str[start - 1] !== '\n') return;

  const lineEnd = str.indexOf('\n', start);
  if (lineEnd === -1) return;

  const line = str.slice(start, lineEnd).replace(/\r$/, '');
  const match = /^((?:(?:[^\S\r\n]*>){0,3}|[-*+]|[0-9]+\.)[^\S\r\n]*)(`{3,}|~{3,})[^\r\n]*$/.exec(line);
  if (!match) return;

  return {
    char: match[2][0] as '`' | '~',
    end: lineEnd + 1,
    size: match[2].length
  };
};

const findFenceEnd = (str: string, fence: Fence) => {
  let lineStart = fence.end;
  while (lineStart < str.length) {
    const lineEnd = str.indexOf('\n', lineStart);
    const end = lineEnd === -1 ? str.length : lineEnd;
    const line = str.slice(lineStart, end).replace(/\r$/, '');
    const match = /^(?:(?:[^\S\r\n]*>){0,3}[^\S\r\n]*)(`+|~+)\s*$/.exec(line);
    if (match && match[1][0] === fence.char && match[1].length >= fence.size) {
      return lineEnd === -1 ? str.length : lineEnd + 1;
    }
    if (lineEnd === -1) break;
    lineStart = lineEnd + 1;
  }
  return str.length;
};

export const scanPostSegments = (str: string): Segment[] => {
  const segments: Segment[] = [];
  let textStart = 0;
  let index = 0;

  const pushSegment = (type: SegmentType, start: number, end: number) => {
    if (textStart < start) segments.push({ type: 'text', start: textStart, end: start });
    segments.push({ type, start, end });
    textStart = end;
    index = end;
  };

  while (index < str.length) {
    const fence = findFence(str, index);
    if (fence) {
      pushSegment('fenced-code', index, findFenceEnd(str, fence));
      continue;
    }

    if (str[index] === '`' && str[index - 1] !== '\\') {
      const size = countBackticks(str, index);
      const end = findInlineCodeEnd(str, index, size);
      if (end !== -1) {
        pushSegment('inline-code', index, end);
        continue;
      }
      index += size;
      continue;
    }

    if (str.startsWith('<!--', index)) {
      const commentEnd = str.indexOf('-->', index + 4);
      pushSegment('html-comment', index, commentEnd === -1 ? str.length : commentEnd + 3);
      continue;
    }

    index++;
  }

  if (textStart < str.length) segments.push({ type: 'text', start: textStart, end: str.length });
  return segments;
};

export const getHtmlCommentRanges = (str: string) => scanPostSegments(str)
  .filter(segment => segment.type === 'html-comment')
  .map(({ start, end }) => ({ start, end }));

const findDelimiterEnd = (str: string, start: number, delimiter: string) => {
  let quote = '';
  let regex = false;
  let index = start;

  while (index < str.length) {
    const char = str[index];
    if (quote) {
      if (char === '\\') {
        index += 2;
        continue;
      }
      if (char === quote) quote = '';
      index++;
      continue;
    }
    if (regex) {
      if (char === '\\') {
        index += 2;
        continue;
      }
      if (char === '/') regex = false;
      index++;
      continue;
    }
    if (char === '"' || char === '\'') {
      quote = char;
      index++;
      continue;
    }
    const previous = str[index - 1];
    if (char === 'r' && str[index + 1] === '/'
      && (index === start || NUNJUCKS_TOKEN_BOUNDARIES.includes(previous))) {
      regex = true;
      index += 2;
      continue;
    }
    if (str.startsWith(delimiter, index) || str.startsWith(`-${delimiter}`, index)) {
      return index + delimiter.length + (str[index] === '-' ? 1 : 0);
    }
    index++;
  }
  return -1;
};

const getBlockName = (raw: string) => {
  let content = raw.slice(BLOCK_START.length, -BLOCK_END.length).trim();
  if (content.startsWith('-')) content = content.slice(1).trimStart();
  if (content.endsWith('-')) content = content.slice(0, -1).trimEnd();
  return /^([^\s]+)/.exec(content)?.[1] || '';
};

const scanNunjucks = (str: string): NunjucksToken[] => {
  const tokens: NunjucksToken[] = [];
  let index = 0;

  while (index < str.length) {
    if (str.startsWith(COMMENT_START, index)) {
      const close = str.indexOf(COMMENT_END, index + COMMENT_START.length);
      if (close === -1) {
        index += COMMENT_START.length;
        continue;
      }
      const end = close + COMMENT_END.length;
      tokens.push({ type: 'comment', start: index, end });
      index = end;
      continue;
    }

    if (str.startsWith(BLOCK_START, index)) {
      const end = findDelimiterEnd(str, index + BLOCK_START.length, BLOCK_END);
      if (end === -1) {
        index += BLOCK_START.length;
        continue;
      }
      tokens.push({
        type: 'block',
        name: getBlockName(str.slice(index, end)),
        start: index,
        end
      });
      index = end;
      continue;
    }

    if (str.startsWith(VARIABLE_START, index)) {
      const end = findDelimiterEnd(str, index + VARIABLE_START.length, VARIABLE_END);
      if (end === -1) {
        index += VARIABLE_START.length;
        continue;
      }
      tokens.push({ type: 'variable', start: index, end });
      index = end;
      continue;
    }

    index++;
  }

  return tokens;
};

const pairNunjucksBlocks = (tokens: NunjucksToken[]) => {
  const endNames = new Set(tokens
    .filter(token => token.type === 'block' && token.name?.startsWith('end'))
    .map(token => token.name!.slice(3)));
  const stack: Array<{ index: number, name: string }> = [];
  const pairs = new Map<number, number>();

  tokens.forEach((token, index) => {
    if (token.type !== 'block' || !token.name) return;
    if (token.name.startsWith('end')) {
      const name = token.name.slice(3);
      const opening = stack[stack.length - 1];
      if (opening?.name === name) {
        pairs.set(opening.index, index);
        stack.pop();
      }
    } else if (endNames.has(token.name)) {
      stack.push({ index, name: token.name });
    }
  });

  return pairs;
};

class PostRenderEscape {
  private readonly codeBlocks: Array<string | null> = [];
  private readonly comments: Array<string | null> = [];
  private readonly swig: Array<string | null> = [];
  public hasNunjucks = false;

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
    return str.replace(rSwigPlaceHolder, PostRenderEscape.restoreContent(this.swig));
  }

  restoreCodeBlocks(str: string) {
    return str.replace(rCodeBlockPlaceHolder, PostRenderEscape.restoreContent(this.codeBlocks));
  }

  restoreComments(str: string) {
    return str.replace(rCommentHolder, PostRenderEscape.restoreContent(this.comments));
  }

  escapeCodeBlocks(str: string) {
    return str.replace(/<hexoPostRenderCodeBlock>([\s\S]+?)<\/hexoPostRenderCodeBlock>/g,
      (_, content) => PostRenderEscape.escapeContent(this.codeBlocks, 'code', content));
  }

  private escapeComment(str: string) {
    // Nunjucks does not reparse expression output, so this recreates the first
    // brace after rendering without evaluating the original comment contents.
    const protectedComment = str.replace(/\{(?=[{%#])/g, () => {
      this.hasNunjucks = true;
      return '{{ "{" }}';
    });
    return PostRenderEscape.escapeContent(this.comments, 'comment', protectedComment);
  }

  private escapeSwig(str: string) {
    return PostRenderEscape.escapeContent(this.swig, 'swig', str);
  }

  private escapeInlineCode(str: string) {
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

  escapeAllSwigTags(str: string) {
    if (!str.includes(VARIABLE_START) && !str.includes(BLOCK_START) && !str.includes(COMMENT_START)) return str;

    const contexts: string[] = [];
    const contextPlaceholder = (value: string) => `hexoPostRenderContext\uFFFC${contexts.push(value) - 1}\uFFFC`;
    const restoreContexts = (value: string) => value.replace(rContextHolder, (_, index) => contexts[Number(index)]);

    const contextual = scanPostSegments(str).map(segment => {
      const value = str.slice(segment.start, segment.end);
      if (segment.type === 'html-comment') return this.escapeComment(value);
      if (segment.type === 'inline-code') return contextPlaceholder(this.escapeInlineCode(value));
      if (segment.type === 'fenced-code') return contextPlaceholder(value);
      return value;
    }).join('');

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

export default PostRenderEscape;

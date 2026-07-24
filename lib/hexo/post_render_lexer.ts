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

export const BLOCK_START = '{%';
export const BLOCK_END = '%}';
export const VARIABLE_START = '{{';
export const VARIABLE_END = '}}';
export const COMMENT_START = '{#';
export const COMMENT_END = '#}';
const NUNJUCKS_TOKEN_BOUNDARIES = ' \n\t\r\u00A0()[]{}%*-+~/#,:|.<>=!';

type SimpleSegmentType = 'text' | 'inline-code' | 'html-comment';

interface SimpleSegment {
  end: number;
  start: number;
  type: SimpleSegmentType;
}

export interface FencedCodeSegment {
  closed: boolean;
  closingEnd: number;
  contentEnd: number;
  contentStart: number;
  end: number;
  info: string;
  marker: string;
  prefix: string;
  start: number;
  type: 'fenced-code';
}

export type PostSegment = SimpleSegment | FencedCodeSegment;

export type NunjucksTokenType = 'block' | 'variable' | 'comment';

export interface NunjucksToken {
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
  contentStart: number;
  info: string;
  marker: string;
  prefix: string;
  size: number;
}

interface FenceEnd {
  closed: boolean;
  closingEnd: number;
  contentEnd: number;
  end: number;
}

const trimHorizontalWhitespace = (str: string) => str
  .replace(/^[^\S\r\n]*/, '')
  .replace(/[^\S\r\n]*$/, '');

const findFence = (str: string, start: number): Fence | undefined => {
  if (start > 0 && str[start - 1] !== '\n') return;

  const lineEnd = str.indexOf('\n', start);
  if (lineEnd === -1) return;

  const line = str.slice(start, lineEnd).replace(/\r$/, '');
  const match = /^((?:(?:[^\S\r\n]*>){0,3}|[-*+]|[0-9]+\.)[^\S\r\n]*)(`{3,}|~{3,})([^\r\n]*)$/.exec(line);
  if (!match) return;

  const info = trimHorizontalWhitespace(match[3]);
  if (info.endsWith('`')) return;

  return {
    char: match[2][0] as '`' | '~',
    contentStart: lineEnd + 1,
    info,
    marker: match[2],
    prefix: match[1],
    size: match[2].length
  };
};

const findFenceEnd = (str: string, fence: Fence): FenceEnd => {
  let lineStart = fence.contentStart;
  while (lineStart < str.length) {
    const lineEnd = str.indexOf('\n', lineStart);
    const end = lineEnd === -1 ? str.length : lineEnd;
    const closingEnd = str[end - 1] === '\r' ? end - 1 : end;
    const line = str.slice(lineStart, closingEnd);
    const match = /^(?:(?:[^\S\r\n]*>){0,3}[^\S\r\n]*)(`+|~+)[^\S\r\n]*$/.exec(line);
    if (match && match[1][0] === fence.char && match[1].length >= fence.size) {
      return {
        closed: true,
        closingEnd,
        contentEnd: lineStart,
        end: lineEnd === -1 ? str.length : lineEnd + 1
      };
    }
    if (lineEnd === -1) break;
    lineStart = lineEnd + 1;
  }
  return {
    closed: false,
    closingEnd: str.length,
    contentEnd: str.length,
    end: str.length
  };
};

export const scanPostSegments = (str: string): PostSegment[] => {
  const segments: PostSegment[] = [];
  let textStart = 0;
  let index = 0;

  const pushSegment = (segment: PostSegment) => {
    if (textStart < segment.start) segments.push({ type: 'text', start: textStart, end: segment.start });
    segments.push(segment);
    textStart = segment.end;
    index = segment.end;
  };

  while (index < str.length) {
    const fence = findFence(str, index);
    if (fence) {
      const fenceEnd = findFenceEnd(str, fence);
      pushSegment({
        type: 'fenced-code',
        start: index,
        prefix: fence.prefix,
        marker: fence.marker,
        info: fence.info,
        contentStart: fence.contentStart,
        ...fenceEnd
      });
      continue;
    }

    if (str[index] === '`' && str[index - 1] !== '\\') {
      const size = countBackticks(str, index);
      const end = findInlineCodeEnd(str, index, size);
      if (end !== -1) {
        pushSegment({ type: 'inline-code', start: index, end });
        continue;
      }
      index += size;
      continue;
    }

    if (str.startsWith('<!--', index)) {
      const commentEnd = str.indexOf('-->', index + 4);
      pushSegment({ type: 'html-comment', start: index, end: commentEnd === -1 ? str.length : commentEnd + 3 });
      continue;
    }

    index++;
  }

  if (textStart < str.length) segments.push({ type: 'text', start: textStart, end: str.length });
  return segments;
};

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

export const scanNunjucks = (str: string): NunjucksToken[] => {
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

export const pairNunjucksBlocks = (tokens: NunjucksToken[]) => {
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

export const BLOCK_START = '{%';
export const VARIABLE_START = '{{';
export const COMMENT_START = '{#';

const BLOCK_END = '%}';
const VARIABLE_END = '}}';
const COMMENT_END = '#}';

interface TextSegment {
  end: number;
  start: number;
  type: 'text';
}

interface HtmlCommentSegment {
  end: number;
  start: number;
  type: 'html-comment';
}

interface SourceRange {
  end: number;
  start: number;
}

export interface InlineCodeSegment {
  end: number;
  nunjucks: NunjucksToken[];
  rawBlocks: SourceRange[];
  start: number;
  type: 'inline-code';
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

export type PostSegment = TextSegment | HtmlCommentSegment | InlineCodeSegment | FencedCodeSegment;
export type NunjucksTokenType = 'block' | 'variable' | 'comment';

export interface NunjucksToken {
  end: number;
  name?: string;
  start: number;
  type: NunjucksTokenType;
}

export interface PostTokens {
  nunjucks: NunjucksToken[];
  segments: PostSegment[];
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

const canStartRegex = (str: string, index: number, expressionStart: number) => index === expressionStart
  || /[\s()[\]{}%*+\-~/#,:|.<>=!]/.test(str[index - 1]);

const findExpressionEnd = (str: string, start: number, delimiter: string) => {
  let mode: 'code' | 'quote' | 'regex' = 'code';
  let quote = '';

  for (let index = start; index < str.length; index++) {
    const char = str[index];

    if (mode === 'quote') {
      if (char === '\\') {
        index++;
      } else if (char === quote) {
        mode = 'code';
      }
      continue;
    }

    if (mode === 'regex') {
      if (char === '\\') {
        index++;
      } else if (char === '/') {
        mode = 'code';
      }
      continue;
    }

    if (char === '"' || char === '\'') {
      mode = 'quote';
      quote = char;
      continue;
    }

    if (char === 'r' && str[index + 1] === '/' && canStartRegex(str, index, start)) {
      mode = 'regex';
      index++;
      continue;
    }

    if (str.startsWith(delimiter, index)) return index + delimiter.length;
    if (char === '-' && str.startsWith(delimiter, index + 1)) return index + delimiter.length + 1;
  }

  return -1;
};

const getBlockName = (raw: string) => {
  let content = raw.slice(BLOCK_START.length, -BLOCK_END.length).trim();
  if (content.startsWith('-')) content = content.slice(1).trimStart();
  if (content.endsWith('-')) content = content.slice(0, -1).trimEnd();
  return /^([^\s]+)/.exec(content)?.[1] || '';
};

const readNunjucksToken = (str: string, start: number): NunjucksToken | undefined => {
  if (str.startsWith(COMMENT_START, start)) {
    const closing = str.indexOf(COMMENT_END, start + COMMENT_START.length);
    if (closing === -1) return;
    return { type: 'comment', start, end: closing + COMMENT_END.length };
  }

  let type: 'block' | 'variable', opening: string, closing: string;
  if (str.startsWith(BLOCK_START, start)) {
    type = 'block';
    opening = BLOCK_START;
    closing = BLOCK_END;
  } else if (str.startsWith(VARIABLE_START, start)) {
    type = 'variable';
    opening = VARIABLE_START;
    closing = VARIABLE_END;
  } else {
    return;
  }

  const end = findExpressionEnd(str, start + opening.length, closing);
  if (end === -1) return;

  const token: NunjucksToken = { type, start, end };
  if (type === 'block') token.name = getBlockName(str.slice(start, end));
  return token;
};

const findRawBlockEnd = (str: string, opening: NunjucksToken) => {
  let index = opening.end;
  while (index < str.length) {
    const start = str.indexOf(BLOCK_START, index);
    if (start === -1) return;

    const token = readNunjucksToken(str, start);
    if (!token) {
      index = start + BLOCK_START.length;
      continue;
    }
    if (token.name === 'endraw') return token;
    index = token.end;
  }
};

const findInlineCode = (str: string, start: number, size: number): Omit<InlineCodeSegment, 'start' | 'type'> | undefined => {
  const nunjucks: NunjucksToken[] = [];
  const rawBlocks: SourceRange[] = [];
  let index = start + size;

  while (index < str.length) {
    if (isBlankLineBoundary(str, index)) return;

    if (str.startsWith(BLOCK_START, index)) {
      const opening = readNunjucksToken(str, index);
      if (opening) {
        nunjucks.push(opening);
        if (opening.name === 'raw') {
          const closing = findRawBlockEnd(str, opening);
          if (closing) {
            nunjucks.push(closing);
            rawBlocks.push({ start: opening.start, end: closing.end });
            index = closing.end;
            continue;
          }
        }
      }
    } else if (str.startsWith(VARIABLE_START, index) || str.startsWith(COMMENT_START, index)) {
      const token = readNunjucksToken(str, index);
      if (token) nunjucks.push(token);
    }

    if (str[index] === '`') {
      const currentSize = countBackticks(str, index);
      if (currentSize === size) {
        const end = index + size;
        return {
          end,
          nunjucks: nunjucks.filter(token => token.end <= end),
          rawBlocks: rawBlocks.filter(block => block.end <= end)
        };
      }
      index += currentSize;
    } else {
      index++;
    }
  }
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

export const lexPost = (str: string, enableNunjucks = true): PostTokens => {
  const segments: PostSegment[] = [];
  const nunjucks: NunjucksToken[] = [];
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
      const inline = findInlineCode(str, index, size);
      if (inline) {
        pushSegment({ type: 'inline-code', start: index, ...inline });
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

    if (enableNunjucks && str[index] === '{') {
      const token = readNunjucksToken(str, index);
      if (token) {
        nunjucks.push(token);
        index = token.end;
        continue;
      }
    }

    index++;
  }

  if (textStart < str.length) segments.push({ type: 'text', start: textStart, end: str.length });
  return { segments, nunjucks };
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

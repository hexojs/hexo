import { basename, extname, join } from 'path';
import { htmlTag, url_for } from 'hexo-util';
import type Hexo from '../../hexo';

const rCaptionTitleFile = /(.*)?(?:\s+|^)(\/*\S+)/;
const rLang = /\s*lang:(\w+)/i;
const rFrom = /\s*from:(\d+)/i;
const rTo = /\s*to:(\d+)/i;

/**
* Include code tag
*
* Syntax:
*   {% include_code [title] [lang:language] path/to/file %}
*/

export = (ctx: Hexo) => function includeCodeTag(args: string[]) {
  let codeDir = ctx.config.code_dir;
  let arg = args.join(' ');

  // Add trailing slash to codeDir
  if (!codeDir.endsWith('/')) codeDir += '/';

  let lang = '';
  arg = arg.replace(rLang, (match, _lang) => {
    lang = _lang;
    return '';
  });
  let from = 0;
  arg = arg.replace(rFrom, (match, _from) => {
    from = _from - 1;
    return '';
  });
  let to = Number.MAX_VALUE;
  arg = arg.replace(rTo, (match, _to) => {
    to = _to;
    return '';
  });

  const match = arg.match(rCaptionTitleFile);

  // Exit if path is not defined
  if (!match) return;

  const path = match[2];

  // If the language is not defined, use file extension instead
  lang = lang || extname(path).substring(1);

  const source = join(codeDir, path).replace(/\\/g, '/');

  // Prevent path traversal: https://github.com/hexojs/hexo/issues/5250
  const Page = ctx.model('Page');
  const doc = Page.findOne({ source });
  if (!doc) return;

  let code = doc.content;
  const lines = code.split('\n');
  code = lines.slice(from, to).join('\n').trim();

  // If the title is not defined, use file name instead
  const title = match[1] || basename(path);
  const caption = htmlTag('span', {}, title) + `<a href="${url_for.call(ctx, doc.path)}">view raw</a>`;

  if (ctx.extend.highlight.query(ctx.config.syntax_highlighter)) {
    const options = {
      lang,
      caption,
      lines_length: lines.length
    };
    return ctx.extend.highlight.exec(ctx.config.syntax_highlighter, {
      context: ctx,
      args: [code, options]
    });
  }
  return `<pre><code>${code}</code></pre>`;
};

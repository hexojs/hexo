'use strict';

const fs = require('hexo-fs');
const { basename, extname, join } = require('path');
const stripIndent = require('strip-indent');
const { highlight } = require('hexo-util');

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

module.exports = ctx => function includeCodeTag(args) {
  const config = ctx.config.highlight || {};
  let codeDir = ctx.config.code_dir;
  let arg = args.join(' ');

  // Add trailing slash to codeDir
  if (codeDir[codeDir.length - 1] !== '/') codeDir += '/';

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

  // If the title is not defined, use file name instead
  const title = match[1] || basename(path);

  // If the language is not defined, use file extension instead
  lang = lang || extname(path).substring(1);

  const src = join(ctx.source_dir, codeDir, path);

  const caption = `<span>${title}</span><a href="${ctx.config.root}${codeDir}${path}">view raw</a>`;

  const options = {
    lang,
    caption,
    gutter: config.line_number,
    hljs: config.hljs,
    tab: config.tab_replace
  };

  return fs.exists(src).then(exist => {
    if (exist) return fs.readFile(src);
  }).then(code => {
    if (!code) return;

    code = stripIndent(code);
    const lines = code.split('\n');
    code = lines.slice(from, to).join('\n').trim();

    if (!config.enable) {
      return `<pre><code>${code}</code></pre>`;
    }

    return highlight(code, options);
  });
};

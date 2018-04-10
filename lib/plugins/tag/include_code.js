'use strict';

const fs = require('hexo-fs');
const pathFn = require('path');
const stripIndent = require('strip-indent');
const util = require('hexo-util');
const highlight = util.highlight;

const rCaptionTitleFile = /(.*)?(\s+|^)(\/*\S+)/;
const rLang = /\s*lang:(\w+)/i;

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
  if (rLang.test(arg)) {
    arg = arg.replace(rLang, (match, _lang) => {
      lang = _lang;
      return '';
    });
  }

  let title = '';
  let path = '';
  if (rCaptionTitleFile.test(arg)) {
    const match = arg.match(rCaptionTitleFile);
    title = match[1];
    path = match[3];
  }

  // Exit if path is not defined
  if (!path) return;

  const src = pathFn.join(ctx.source_dir, codeDir, path);

  return fs.exists(src).then(exist => {
    if (exist) return fs.readFile(src);
  }).then(code => {
    if (!code) return;

    code = stripIndent(code).trim();

    if (!config.enable) {
      return `<pre><code>${code}</code></pre>`;
    }

    // If the title is not defined, use file name instead
    title = title || pathFn.basename(path);

    // If the language is not defined, use file extension instead
    lang = lang || pathFn.extname(path).substring(1);

    const caption = `<span>${title}</span><a href="${ctx.config.root}${codeDir}${path}">view raw</a>`;

    return highlight(code, {
      lang,
      caption,
      gutter: config.line_number,
      hljs: config.hljs,
      tab: config.tab_replace
    });
  });
};

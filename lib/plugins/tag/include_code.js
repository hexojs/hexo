var fs = require('graceful-fs'),
  pathFn = require('path'),
  util = require('../../util'),
  file = util.file2,
  highlight = util.highlight;

var rCaptionTitleFile = /(.*)?(\s+|^)(\/*\S+)/i,
  rLang = /\s*lang:(\w+)/i;

/**
* Include code tag
*
* Syntax:
*   {% include_code [title] [lang:language] path/to/file %}
*/

module.exports = function(args, callback){
  var codeDir = hexo.config.code_dir,
    sourceDir = hexo.source_dir,
    config = hexo.config.highlight || {},
    arg = args.join(' '),
    path = '',
    title = '',
    lang = '';

  // Suffix code folder
  if (codeDir[codeDir.length - 1] !== '/') codeDir += '/';

  if (rLang.test(arg)){
    lang = arg.match(rLang)[1];
    arg = arg.replace(/lang:\w+/i, '');
  }

  if (rCaptionTitleFile.test(arg)){
    var match = arg.match(rCaptionTitleFile);
    title = match[1];
    path = match[3];
  }

  // Exit if path is not defined
  if (!path) return;

  var local = pathFn.join(sourceDir, codeDir, path);

  // Exit if the source file doesn't exist
  if (!fs.existsSync(local)) return;

  var code = file.readFileSync(local).replace(/\n$/, '');

  // If the title is not defined, use file name instead
  title = title || pathFn.basename(path);

  // If the language is not defined, use file extension instead
  lang = lang || pathFn.extname(path).substring(1);

  caption = '<span>' + title + '</span><a href="/' + codeDir + path + '">download</a>';

  return highlight(code, {
    lang: lang,
    caption: caption,
    gutter: config.line_number,
    tab: config.tab_replace
  });
};

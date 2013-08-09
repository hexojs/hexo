// Based on: https://raw.github.com/imathis/octopress/master/plugins/code_block.rb

var vsprintf = require('sprintf-js').vsprintf,
  util = require('../../util'),
  highlight = util.highlight;

var rCaptionUrlTitle = /(\S[\S\s]*)\s+(https?:\/\/)(\S+)\s+(.+)/i,
  rCaptionUrl = /(\S[\S\s]*)\s+(https?:\/\/)(\S+)/i,
  rCaption = /(\S[\S\s]*)/,
  rLang = /\s*lang:(\w+)/i;

/**
 * Code block tag
 *
 * Syntax:
 *   {% codeblock [title] [lang:language] [url] [link text] %}
 *   code snippet
 *   {% endcodeblock %}
 */

module.exports = function(args, content){
  var config = hexo.config.highlight ? hexo.config.highlight : {},
    arg = args.join(' ');

  if (rLang.test(arg)){
    var lang = arg.match(rLang)[1];
    arg = arg.replace(/lang:\w+/i, '');
  } else {
    var lang = '';
  }

  if (rCaptionUrlTitle.test(arg)){
    var match = arg.match(rCaptionUrlTitle),
      caption = vsprintf('<span>%s</span><a href="%s%s">%s</a>', match);
  } else if (rCaptionUrl.test(arg)){
    var match = arg.match(rCaptionUrlTitle),
      caption = vsprintf('<span>%s</span><a href="%s%s">link</a>', match);
  } else if (rCaption.test(arg)){
    var match = arg.match(rCaption),
      caption = vsprintf('<span>%s</span>', match);
  }

  return highlight(content, {
    lang: lang,
    caption: caption,
    gutter: config.line_number,
    tab: config.tab_replace
  });
};
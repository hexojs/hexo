// Based on: https://raw.github.com/imathis/octopress/master/plugins/code_block.rb

var util = require('../../util'),
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
  var arg = args.join(' '),
    config = hexo.config.highlight || {};

  if (rLang.test(arg)){
    var lang = arg.match(rLang)[1];
    arg = arg.replace(/lang:\w+/i, '');
  } else {
    var lang = '';
  }

  if (rCaptionUrlTitle.test(arg)){
    var match = arg.match(rCaptionUrlTitle),
      caption = '<span>' + match[1] + '</span><a href="' + match[2] + match[3] + '">' + match[4] + '</a>';
  } else if (rCaptionUrl.test(arg)){
    var match = arg.match(rCaptionUrl),
      caption = '<span>' + match[1] + '</span><a href="' + match[2] + match[3] + '">link</a>';
  } else if (rCaption.test(arg)){
    var match = arg.match(rCaption),
      caption = '<span>' + match[1] + '</span>';
  }

  return highlight(content, {
    lang: lang,
    caption: caption,
    gutter: config.line_number,
    tab: config.tab_replace
  });
};
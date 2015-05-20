'use strict';

// Based on: https://raw.github.com/imathis/octopress/master/plugins/code_block.rb

var util = require('hexo-util');
var highlight = util.highlight;
var stripIndent = require('strip-indent');

var rCaptionUrlTitle = /(\S[\S\s]*)\s+(https?:\/\/)(\S+)\s+(.+)/i;
var rCaptionUrl = /(\S[\S\s]*)\s+(https?:\/\/)(\S+)/i;
var rCaption = /(\S[\S\s]*)/;
var rLang = /\s*lang:(\w+)/i;

/**
* Code block tag
*
* Syntax:
*   {% codeblock [title] [lang:language] [url] [link text] %}
*   code snippet
*   {% endcodeblock %}
*/

module.exports = function(ctx){
  return function codeTag(args, content){
    var arg = args.join(' ');
    var config = ctx.config.highlight || {};

    if (!config.enable){
      return '<pre><code>' + content + '</code></pre>';
    }

    var caption = '';
    var lang = '';
    var match;

    if (rLang.test(arg)){
      arg = arg.replace(rLang, function(){
        lang = arguments[1];
        return '';
      });
    }

    if (rCaptionUrlTitle.test(arg)){
      match = arg.match(rCaptionUrlTitle);
      caption = '<span>' + match[1] + '</span><a href="' + match[2] + match[3] + '">' + match[4] + '</a>';
    } else if (rCaptionUrl.test(arg)){
      match = arg.match(rCaptionUrl);
      caption = '<span>' + match[1] + '</span><a href="' + match[2] + match[3] + '">link</a>';
    } else if (rCaption.test(arg)){
      match = arg.match(rCaption);
      caption = '<span>' + match[1] + '</span>';
    }

    content = stripIndent(content).trim();

    content = highlight(content, {
      lang: lang,
      caption: caption,
      gutter: config.line_number,
      tab: config.tab_replace,
      autoDetect: config.auto_detect
    });

    content = content.replace(/{/g, '&#123;')
      .replace(/}/g, '&#125;');

    return content;
  };
};
'use strict';

var stripIndent = require('strip-indent');
var util = require('hexo-util');
var highlight = util.highlight;

var rBacktick = /(\s*)(`{3,}|~{3,}) *(.*) *\n([\s\S]+?)\s*\2(\n+|$)/g;
var rAllOptions = /([^\s]+)\s+(.+?)\s+(https?:\/\/\S+|\/\S+)\s*(.+)?/;
var rLangCaption = /([^\s]+)\s*(.+)?/;

function backtickCodeBlock(data){
  /* jshint validthis: true */
  var config = this.config.highlight || {};
  if (!config.enable) return;

  data.content = data.content.replace(rBacktick, function(){
    var start = arguments[1];
    var end = arguments[5];
    var args = arguments[3];
    var content = arguments[4];

    var options = {
      autoDetect: config.auto_detect,
      gutter: config.line_number,
      tab: config.tab_replace,
      exclude: config.exclude
    };

    if (args){
      var match;

      if (rAllOptions.test(args)){
        match = args.match(rAllOptions);
      } else if (rLangCaption.test(args)){
        match = args.match(rLangCaption);
      }

      if (match) {
        options.lang = match[1];
        if(options.exclude &&
           options.exclude.indexOf(options.lang) > -1) {
          return arguments[0];
        }

        if (match[2]){
          options.caption = '<span>' + match[2] + '</span>';

          if (match[3]){
            options.caption += '<a href="' + match[3] + '">' + (match[4] ? match[4] : 'link') + '</a>';
          }
        }
      }
    }

    content = highlight(stripIndent(content), options)
      .replace(/{/g, '&#123;')
      .replace(/}/g, '&#125;');

    return start + '<escape>' + content + '</escape>' + (end ? '\n\n' : '');
  });
}

module.exports = backtickCodeBlock;

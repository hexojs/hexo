var stripIndent = require('strip-indent');
var util = require('hexo-util');
var highlight = util.highlight;

var rBacktick = /\n*(`{3,}|~{3,}) *(.+)? *\n([\s\S]+?)\s*\1\n*/g;
var rAllOptions = /([^\s]+)\s+(.+?)\s+(https?:\/\/\S+|\/\S+)\s*(.+)?/;
var rLangCaption = /([^\s]+)\s*(.+)?/;

module.exports = function(data){
  var config = this.config.highlight || {};
  if (!config.enable) return;

  data.content = data.content.replace(rBacktick, function(m, ticks, args, str){
    var options = {
      gutter: config.line_number,
      tab: config.tab_replace
    };

    if (args){
      var match;

      if (rAllOptions.test(args)){
        match = args.match(rAllOptions);
      } else if (rLangCaption.test(args)){
        match = args.match(rLangCaption);
      }

      options.lang = match[1];

      if (match[2]){
        options.caption = '<span>' + match[2] + '</span>';

        if (match[3]){
          options.caption += '<a href="' + match[3] + '">' + (match[4] ? match[4] : 'link') + '</a>';
        }
      }
    }

    return '\n\n<escape>' + highlight(stripIndent(str), options).replace(/&amp;/g, '&') + '</escape>\n\n';
  });
};
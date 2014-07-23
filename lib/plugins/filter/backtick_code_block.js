var stripIndent = require('strip-indent'),
  util = require('../../util'),
  highlight = util.highlight;

var rBacktick = /\n*(`{3,}|~{3,}) *(.+)? *\n([\s\S]+?)\s*\1\n*/g,
  rAllOptions = /([^\s]+)\s+(.+?)\s+(https?:\/\/\S+|\/\S+)\s*(.+)?/i,
  rLangCaption = /([^\s]+)\s*(.+)?/i;

module.exports = function(data, callback){
  var config = hexo.config.highlight || {};

  if (!config.enable) return callback();

  data.content = data.content.replace(rBacktick, function(){
    var args = arguments[2],
      str = arguments[3];

    var options = {
      gutter: config.line_number,
      tab: config.tab_replace
    };

    var match;

    if (args){
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

  callback(null, data);
};
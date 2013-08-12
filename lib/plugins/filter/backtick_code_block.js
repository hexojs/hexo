var util = require('../../util'),
  highlight = util.highlight;

var rBacktick = / *(`{3,}|~{3,}) *([^\n]+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/g,
  rAllOptions = /([^\s]+)\s+(.+?)\s+(https?:\/\/\S+|\/\S+)\s*(.+)?/i,
  rLangCaption = /([^\s]+)\s*(.+)?/i;

module.exports = function(data){
  var config = hexo.config.highlight;

  if (!config || !config.enable) return;

  data.content = data.content.replace(rBacktick, function(){
    var args = arguments[2],
      str = arguments[3];

    var options = {
      gutter: config.line_number,
      tab: config.tab_replace
    };

    var indent = str.match(/^(\t*)/)[1].length,
      code = [];

    if (args){
      if (rAllOptions.test(args)){
        var match = args.match(rAllOptions);
      } else if (rLangCaption.test(args)){
        var match = args.match(rLangCaption);
      }

      options.lang = match[1];

      if (match[2]){
        options.caption = '<span>' + match[2] + '</span>';

        if (match[3]){
          options.caption += '<a href="' + match[3] + '">' + (match[4] ? match[4] : 'link') + '</a>';
        }
      }
    }

    var rIndent = new RegExp('^\\t{' + indent + '}');

    str.split('\n').forEach(function(line){
      if (indent){
        code.push(line.replace(rIndent, ''));
      } else {
        code.push(line);
      }
    });

    return '<escape indent="' + indent + '">' + highlight(code.join('\n'), options).replace(/&amp;/g, '&') + '</escape>\n';
  });

  return data;
};
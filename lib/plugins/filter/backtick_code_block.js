var util = require('../../util'),
  highlight = util.highlight;

var rBacktick = /(`{3,}|~{3,}) *(.+)? *\n([\s\S]+?)\s*\1/g,
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

    var lines = str.split('\n'),
      indent = lines[0].match(/^(\s*)/)[1].length,
      rIndent = new RegExp('^ {' + indent + '}');

    // Remove indentations
    lines = lines.map(function(line){
      return line.replace(rIndent, '');
    });

    return '<escape>' + highlight(lines.join('\n'), options).replace(/&amp;/g, '&') + '</escape>';
  });

  callback(null, data);
};
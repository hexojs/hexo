var extend = require('../../extend'),
  config = hexo.config,
  highlightConfig = config.highlight,
  highlightEnable = highlightConfig.enable,
  backtickConfig = highlightConfig.backtick_code_block,
  lineNumConfig = highlightConfig.line_number,
  tabConfig = highlightConfig.tab_replace;

extend.filter.register('pre', function(data){
  if (!highlightEnable || !backtickConfig) return;

  data.content = data.content.replace(/`{3,} *([^\n]*)?\n([\s\S]+?)\n`{3,}/g, function(match, args, str){
    var options = {gutter: lineNumConfig, tab: tabConfig};

    str = str
      .replace(/</g, '\&lt;')
      .replace(/>/g, '\&gt;');

    if (args){
      var matched = args.match(/([^\s]+)\s+(.+?)(https?:\/\/\S+)\s*(.+)?/i);

      if (matched){
        var lang = matched[1],
          caption = '<span>' + matched[2] + '</span>';

        if (matched[3]){
          caption += '<a href="' + matched[3] + '">' + (matched[4] ? matched[4] : 'link') + '</a>';
        }

        options.lang = lang;
        options.caption = caption;
      } else {
        options.lang = args;
      }
    }

    if (lineNumConfig){
      return '<notextile>' + highlight(str, options).replace(/&amp;/g, '&') + '</notextile>';
    } else {
      return '<notextile><pre><code>' + highlight(str, options).replace(/&amp;/g, '&') + '</code></pre></notextile>';
    }
  });

  return data;
});
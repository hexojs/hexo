var marked = require('marked'),
  _ = require('underscore'),
  highlight = require('../util').highlight,
  extend = require('../extend');

var regex = {
  backtick: /^`{3}\s*([^\n]+)\n([^`]+)/,
  captionUrl: /([^\s]+)\s*(.*)(https?:\/\/\S+)\s*(.*)/,
  caption: /([^\s]+)\s*(.*)/
};

marked.setOptions({
  gfm: true,
  pedantic: false,
  sanitize: false,
  highlight: highlight
});

var markdown = function(file, content){
  var tokens = _.map(marked.lexer(content), function(item){
    if (item.type === 'paragraph'){
      var text = item.text.match(regex.backtick);

      if (!text) return item;

      var args = text[1],
        code = text[2].replace(/\n$/, '');

      var captionPart = args.match(regex.captionUrl);

      if (captionPart){
        var caption = '<span>' + captionPart[2] + '</span><a href="' + captionPart[3] + '">' + (captionPart[4] ? captionPart[4] : 'link') + '</a>',
          result = highlight(code, captionPart[1], caption);
      } else {
        var captionPart = args.match(regex.caption),
          caption = '<span>' + captionPart[2] + '</span>',
          result = highlight(code, captionPart[1], caption);
      }

      return {
        type: 'html',
        text: '<pre><code>' + result + '</code></pre>'
      }
    } else {
      return item;
    }
  });

  return marked.parser(tokens);
};

extend.renderer.register('md', 'html', markdown, true);
extend.renderer.register('markdown', 'html', markdown, true);
extend.renderer.register('mkd', 'html', markdown, true);
extend.renderer.register('mkdn', 'html', markdown, true);
extend.renderer.register('mdwn', 'html', markdown, true);
extend.renderer.register('mdtxt', 'html', markdown, true);
extend.renderer.register('mdtext', 'html', markdown, true);
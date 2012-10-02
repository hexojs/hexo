var marked = require('marked'),
  highlight = require('highlight').Highlight,
  extend = require('../extend');

marked.setOptions({
  gfm: true,
  pedantic: false,
  sanitize: false,
  highlight: function(code){
    return highlight(code);
  }
});

var markdown = function(file, content){
  return marked(content);
};

extend.renderer.register('md', markdown, true);
extend.renderer.register('markdown', markdown, true);
extend.renderer.register('mkd', markdown, true);
extend.renderer.register('mkdn', markdown, true);
extend.renderer.register('mdwn', markdown, true);
extend.renderer.register('mdtxt', markdown, true);
extend.renderer.register('mdtext', markdown, true);
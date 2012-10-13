var marked = require('marked'),
  highlight = require('../util').highlight,
  extend = require('../extend');

marked.setOptions({
  gfm: true,
  pedantic: false,
  sanitize: false,
  highlight: highlight
});

var markdown = function(file, content){
  return marked(content);
};

extend.render.register('md', 'html', markdown, true);
extend.render.register('markdown', 'html', markdown, true);
extend.render.register('mkd', 'html', markdown, true);
extend.render.register('mkdn', 'html', markdown, true);
extend.render.register('mdwn', 'html', markdown, true);
extend.render.register('mdtxt', 'html', markdown, true);
extend.render.register('mdtext', 'html', markdown, true);
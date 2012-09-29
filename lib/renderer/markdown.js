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

var markdown = function(file, content, callback){
  callback(null, marked(content));
};

extend.renderer.register('md', markdown);
extend.renderer.register('markdown', markdown);
extend.renderer.register('mkd', markdown);
extend.renderer.register('mkdn', markdown);
extend.renderer.register('mdwn', markdown);
extend.renderer.register('mdtxt', markdown);
extend.renderer.register('mdtext', markdown);
var marked = require('marked'),
  _ = require('underscore'),
  hljs = require('highlight.js'),
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
  highlight: function(code, lang){
    try {
      return hljs.highlight(lang, code).value;
    } catch (e){
      return hljs.highlightAuto(code).value;
    }
  }
});

var markdown = function(file, content){
  return marked(content);
};

extend.renderer.register('md', 'html', markdown, true);
extend.renderer.register('markdown', 'html', markdown, true);
extend.renderer.register('mkd', 'html', markdown, true);
extend.renderer.register('mkdn', 'html', markdown, true);
extend.renderer.register('mdwn', 'html', markdown, true);
extend.renderer.register('mdtxt', 'html', markdown, true);
extend.renderer.register('mdtext', 'html', markdown, true);
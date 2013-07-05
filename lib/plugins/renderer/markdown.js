var marked = require('marked'),
  highlight = require('../../util').highlight,
  extend = require('../../extend'),
  _ = require('lodash');

var defaults = {
  gfm: true,
  pedantic: false,
  sanitize: false,
  tables: true,
  breaks: true,
  smartLists: true,
  smartypants: true,
  highlight: function(code, lang){
    return highlight(code, {lang: lang, gutter: false});
  }
};

var markdown = function(data, options){
  return marked(data.text, _.extend(defaults, options));
};

extend.renderer.register('md', 'html', markdown, true);
extend.renderer.register('markdown', 'html', markdown, true);
extend.renderer.register('mkd', 'html', markdown, true);
extend.renderer.register('mkdn', 'html', markdown, true);
extend.renderer.register('mdwn', 'html', markdown, true);
extend.renderer.register('mdtxt', 'html', markdown, true);
extend.renderer.register('mdtext', 'html', markdown, true);
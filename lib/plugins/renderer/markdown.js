var marked = require('marked'),
  _ = require('lodash'),
  util = require('../../util'),
  highlight = util.highlight,
  htmlTag = util.html_tag,
  headingId = {};

var anchorId = function(str){
  return str
    .replace(/\s+/g, '_')
    .replace(/\./g, '-')
    .replace(/-{2,}/g, '-');
};

var r = new marked.Renderer();

// Add id attribute to headings
r.heading = function(text, level){
  var id = anchorId(text);

  // Add a number after id if repeated
  if (headingId.hasOwnProperty(id)){
    id += '-' + headingId[id];
    headingId[text]++;
  } else {
    headingId[id] = 1;
  }

  return htmlTag('h' + level, {id: id}, text) + '\n';
};

marked.setOptions({
  gfm: true,
  pedantic: false,
  sanitize: false,
  tables: true,
  breaks: true,
  smartLists: true,
  smartypants: true,
  renderer: r,
  langPrefix: '',
  highlight: function(code, lang){
    return highlight(code, {lang: lang, gutter: false, wrap: false});
  }
});

module.exports = function(data, options){
  headingId = {};

  return marked(data.text, options)
};
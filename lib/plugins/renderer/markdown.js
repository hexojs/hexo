var marked = require('marked'),
  _ = require('lodash'),
  util = require('../../util'),
  highlight = util.highlight,
  htmlTag = util.html_tag;

var anchorId = function(str){
  return str
    .replace(/\s+/g, '_')
    .replace(/\./g, '-')
    .replace(/[^0-9a-zA-Z_-]/g, function(match){
      return '-' + match.charCodeAt().toString(16) + '-';
    })
    .replace(/-{2,}/g, '-');
};

module.exports = function(data, options){
  var r = new marked.Renderer(),
    headingId = {};

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

  var opts = _.extend({
    gfm: true,
    pedantic: false,
    sanitize: false,
    tables: true,
    breaks: true,
    smartLists: true,
    smartypants: true,
    renderer: r,
    highlight: function(code, lang){
      return highlight(code, {lang: lang, gutter: false, wrap: false});
    }
  }, options);

  // You have to use the lexer or marked will add useless <br> tags in HTML
  var tokens = marked.lexer(data.text, opts);

  return marked.parser(tokens)
};
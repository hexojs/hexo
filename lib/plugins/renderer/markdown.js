var marked = require('marked'),
  _ = require('lodash'),
  util = require('../../util'),
  highlight = util.highlight,
  htmlTag = util.html_tag;

module.exports = function(data, options){
  var r = new marked.Renderer(),
    headingId = {};

  // Add id attribute to headings
  r.heading = function(text, level){
    // Add a number after id if repeated
    if (headingId[text]){
      id = text + '-' + headingId[text];
      headingId[text]++;
    } else {
      id = text;
      headingId[text] = 1;
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

  return marked(data.text, opts);
};
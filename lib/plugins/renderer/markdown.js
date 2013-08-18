var marked = require('marked'),
  highlight = require('../../util').highlight,
  _ = require('lodash');

module.exports = function(data, options){
  var opts = _.extend({
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
  }, options);

  return marked(data.text, opts);
};
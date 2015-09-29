'use strict';

// Based on: https://raw.github.com/imathis/octopress/master/plugins/blockquote.rb

var titlecase = require('titlecase');

var rFullCiteWithTitle = /(\S.*)\s+(https?:\/\/)(\S+)\s+(.+)/i;
var rFullCite = /(\S.*)\s+(https?:\/\/)(\S+)/i;
var rAuthorTitle = /([^,]+),\s*([^,]+)/;
var rAuthor = /(.+)/;

/**
* Blockquote tag
*
* Syntax:
*   {% blockquote [author[, source]] [link] [source_link_title] %}
*   Quote string
*   {% endblockquote %}
*/

module.exports = function(ctx) {
  return function blockquoteTag(args, content) {
    var str = args.join(' ');
    var author = '';
    var source = '';
    var title = '';
    var footer = '';
    var result = '';
    var match;

    if (str) {
      if (rFullCiteWithTitle.test(str)) {
        match = str.match(rFullCiteWithTitle);
        author = match[1];
        source = match[2] + match[3];
        title = ctx.config.titlecase ? titlecase(match[4]) : match[4];
      } else if (rFullCite.test(str)) {
        match = str.match(rFullCite);
        author = match[1];
        source = match[2] + match[3];
      } else if (rAuthorTitle.test(str)) {
        match = str.match(rAuthorTitle);
        author = match[1];
        title = ctx.config.titlecase ? titlecase(match[2]) : match[2];
      } else if (rAuthor.test(str)) {
        match = str.match(rAuthor);
        author = match[1];
      }

      if (author) footer += '<strong>' + author + '</strong>';

      if (source) {
        var link = source.replace(/^https?:\/\/|\/(index.html?)?$/g, '');
        footer += '<cite><a href="' + source + '">' + (title ? title : link) + '</a></cite>';
      } else if (title) {
        footer += '<cite>' + title + '</cite>';
      }
    }

    result += '<blockquote>';
    result += ctx.render.renderSync({text: content, engine: 'markdown'});
    if (footer) result += '<footer>' + footer + '</footer>';
    result += '</blockquote>';

    return result;
  };
};

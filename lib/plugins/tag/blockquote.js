// Based on: https://raw.github.com/imathis/octopress/master/plugins/blockquote.rb

var util = require('../../util'),
  titlecase = util.titlecase;

var rFullCiteWithTitle = /(\S.*)\s+(https?:\/\/)(\S+)\s+(.+)/i,
  rFullCite = /(\S.*)\s+(https?:\/\/)(\S+)/i,
  rAuthorTitle = /([^,]+),\s*([^,]+)/,
  rAuthor = /(.+)/;

/**
 * Blockquote tag
 *
 * Syntax:
 *   {% blockquote [author[, source]] [link] [source_link_title] %}
 *   Quote string
 *   {% endblockquote %}
 */

module.exports = function(args, content){
  var render = hexo.render,
    args = args.join(' ');

  if (args){
    var footer = '';

    if (rFullCiteWithTitle.test(args)){
      var match = args.match(rFullCiteWithTitle),
        author = match[1],
        source = match[2] + match[3],
        title = titlecase(match[4]);
    } else if (rFullCite.test(args)){
      var match = args.match(rFullCite),
        author = match[1],
        source = match[2] + match[3];
    } else if (rAuthorTitle.test(args)){
      var match = args.match(rAuthorTitle),
        author = match[1],
        title = titlecase(match[2]);
    } else if (rAuthor.test(args)){
      var match = args.match(rAuthor),
        author = match[1];
    }

    if (author) footer += '<strong>' + author + '</strong>';

    if (source){
      var url = source.match(/https?:\/\/(.+)/)[1],
        parts = url.split('/'),
        link = '';

      for (var i=0, len=parts.length; i<len; i++){
        var nextLink = link + parts[i] + '/';
        if (nextLink.length < 32) link = nextLink;
        else break;
      }

      if (url !== link) link += '&hellip;';

      footer += '<cite><a href="' + source + '">' + (title ? title : link) + '</a></cite>';
    } else if (title){
      footer += '<cite>' + title + '</cite>';
    }
  }

  return '<blockquote>' + render.renderSync({text: content, engine: 'markdown'}) + (footer ? '<footer>' + footer + '</footer>' : '') + '</blockquote>';
};
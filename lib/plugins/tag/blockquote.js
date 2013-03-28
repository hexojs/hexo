// Based on: https://raw.github.com/imathis/octopress/master/plugins/blockquote.rb

var extend = require('../../extend'),
  renderSync = require('../../render').renderSync,
  util = require('../../util'),
  titlecase = util.titlecase;

var regex = {
  fullCiteWithTitle: /(\S.*)\s+(https?:\/\/)(\S+)\s+(.+)/i,
  fullCite: /(\S.*)\s+(https?:\/\/)(\S+)/i,
  authorWithSource: /([^,]+),\s*([^,]+)/,
  author: /(.+)/
};

var blockquote = function(args, content){
  var args = args.join(' ');

  if (args){
    var footer = '';

    if (regex.fullCiteWithTitle.test(args)){
      var match = args.match(regex.fullCiteWithTitle),
        author = match[1],
        source = match[2] + match[3],
        title = titlecase(match[4]);
    } else if (regex.fullCite.test(args)){
      var match = args.match(regex.fullCite),
        author = match[1],
        source = match[2] + match[3];
    } else if (regex.author.test(args)){
      var match = args.match(regex.author);
      if (regex.authorWithSource.test(args)){
        var author = match[1],
          title = match[2];
      } else {
        var author = match[1];
      }
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

  return '<blockquote>' + renderSync({text: content, engine: 'markdown'}) + (footer ? '<footer>' + footer + '</footer>' : '') + '</blockquote>';
};

extend.tag.register('quote', blockquote, true);
extend.tag.register('blockquote', blockquote, true);
// Based on: https://raw.github.com/imathis/octopress/master/plugins/blockquote.rb

var extend = require('../extend'),
  renderSync = require('../render').renderSync,
  util = require('../util'),
  titlecase = util.titlecase;

var regex = {
  fullCiteWithTitle: /(\S.*)\s+(https?:\/\/)(\S+)\s+(.+)/i,
  fullCite: /(\S.*)\s+(https?:\/\/)(\S+)/i,
  authorWithSource: /([^,]+),\s*([^,]+)/,
  author: /(.+)/
};

var blockquote = function(args, content){
  var args = args.join(' ');

  var footerPart = args.match(regex.fullCiteWithTitle);
  if (footerPart){
    var author = footerPart[1],
      source = footerPart[2] + footerPart[3],
      title = titlecase(footerPart[4]);
  } else {
    var footerPart = args.match(regex.fullCite);
    if (footerPart){
      var author = footerPart[1],
        source = footerPart[2] + footerPart[3];
    } else {
      var footerPart = args.match(regex.author);
      if (footerPart){
        var authorPart = footerPart[1].match(regex.authorWithSource);
        if (authorPart){
          var author = authorPart[1],
            title = authorPart[2];
        } else {
          var author = footerPart[1];
        }
      }
    }
  }

  var footer = '';
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

  var content = renderSync(content, 'md');

  return '<blockquote>' + content + '<footer>' + footer + '</footer></blockquote>';
};

extend.tag.register('quote', blockquote, true);
extend.tag.register('blockquote', blockquote, true);
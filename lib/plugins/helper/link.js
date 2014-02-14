var util = require('../../util'),
  htmlTag = util.html_tag;

exports.link_to = function(path, text, external){
  var attrs = {
    href: path,
    title: text || path
  };

  if (external){
    attrs.target = '_blank';
    attrs.rel = 'external';
  }

  return htmlTag('a', attrs, text || path);
};

exports.mail_to = function(path, text){
  var attrs = {
    href: 'mailto:' + path,
    title: text || path
  };

  return htmlTag('a', attrs, text || path);
};
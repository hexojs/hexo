var url = require('url');

var rTag = /<a(.+?)>(.+?)<\/a>/g,
  rHref = /href="(.*?)"/,
  rTarget = /target="_blank"/;

module.exports = function(data, callback){
  var config = hexo.config;

  if (!config.external_link) return callback();

  data.content = data.content.replace(rTag, function(match, attr, title){
    // Exit if the link has target="_blank" attribute
    if (rTarget.test(attr)) return match;

    var href = attr.match(rHref);

    // Exit if the href attribute not exists
    if (!href) return match;

    var data = url.parse(href[1]);

    // Exit if the link doesn't have protocol, which means it's a internal link
    if (!data.protocol) return match;

    // Exit if the url is started with site url
    if (data.hostname === config.url) return match;

    return '<a' + attr + ' target="_blank">' + title + '</a>';
  });

  callback(null, data);
};
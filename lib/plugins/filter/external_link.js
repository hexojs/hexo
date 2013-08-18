var config = hexo.config;

var rTag = /<a(.+?)>(.+?)<\/a>/g,
  rHref = /href="(.*?)"/,
  rProtocol = /^https?:\/{2}/,
  rTarget = /target="_blank"/;

module.exports = function(data, callback){
  if (!config.external_link) return callback();

  data.content = data.content.replace(rTag, function(match, attr, title){
    // Exit if the link has target="_blank" attribute
    if (rTarget.test(attr)) return match;

    var href = attr.match(rHref);

    // Exit if the href attribute not exists
    if (!href) return match;

    var url = href[1];

    // Exit if the link doesn't have protocol, which means it's a internal link
    if (!rProtocol.test(url)) return match;

    // Exit if the url is started with site url
    if (url.substring(0, config.url.length) === config.url) return match;

    return '<a' + attr + ' target="_blank">' + title + '</a>';
  });

  callback(null, data);
};
var config = hexo.config;

var rTag = /<a\s*([^>]+)\s*>([^<]*)<\/a>/g,
  rHref = /href="(.*)"/,
  rProtocol = /^([a-z]+:)?\/{2}/,
  rTarget = /target="_blank"/;

module.exports = function(data, callback){
  if (!config.external_link) return callback();

  data.content = data.content.replace(rTag, function(match, attr, title){
    var href = attr.match(rHref);

    if (href && rProtocol.test(href[1]) && !rTarget.test(attr)){
      attr += ' target="_blank';
    }

    return '<a ' + attr + '>' + title + '</a>';
  });

  callback(null, data);
};
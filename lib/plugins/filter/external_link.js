var url = require('url'),
  cheerio = require('cheerio');

module.exports = function(data, callback){
  var config = hexo.config;

  if (!config.external_link) return callback();

  var $ = cheerio.load(data.content, {decodeEntities: false});

  $('a').each(function(){
    // Exit if the link has target attribute
    if ($(this).attr('target')) return;

    // Exit if the href attribute doesn't exists
    var href = $(this).attr('href');
    if (!href) return;

    var data = url.parse(href);

    // Exit if the link doesn't have protocol, which means it's a internal link
    if (!data.protocol) return;

    // Exit if the url is started with site url
    if (data.hostname === config.url) return match;

    $(this)
      .attr('target', '_blank')
      .attr('rel', 'external');
  });

  data.content = $.html();

  callback(null, data);
};
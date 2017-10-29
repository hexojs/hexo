'use strict';

var url = require('url');
var cheerio;

function externalLinkFilter(data) {
  var config = this.config;
  if (!config.external_link) return;

  if (!cheerio) cheerio = require('cheerio');

  var $ = cheerio.load(data.content, {decodeEntities: false});
  var siteHost = url.parse(config.url).hostname || config.url;

  $('a').each(function() {
    // Exit if the link has target attribute
    if ($(this).attr('target')) return;

    // Exit if the href attribute doesn't exists
    var href = $(this).attr('href');
    if (!href) return;

    var data = url.parse(href);

    // Exit if the link doesn't have protocol, which means it's a internal link
    if (!data.protocol) return;

    // Exit if the url has same host with config.url
    if (data.hostname === siteHost) return;

    $(this)
      .attr('target', '_blank')
      .attr('rel', 'noopener');
  });

  data.content = $.html();
}

module.exports = externalLinkFilter;

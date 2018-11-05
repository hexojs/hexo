'use strict';

const url = require('url');
let cheerio;

function externalLinkFilter(data) {
  const { config } = this;
  if (!config.external_link) return;

  if (!cheerio) cheerio = require('cheerio');

  const $ = cheerio.load(data.content, {decodeEntities: false});
  const siteHost = url.parse(config.url).hostname || config.url;

  $('a').each(function() {
    // Exit if the link has target attribute
    if ($(this).attr('target')) return;

    // Exit if the href attribute doesn't exists
    const href = $(this).attr('href');
    if (!href) return;

    const data = url.parse(href);

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

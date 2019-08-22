'use strict';

const url = require('url');
let cheerio;

function externalLinkFilter(data) {
  const { config } = this;
  if (!config.external_link) return;

  if (!cheerio) cheerio = require('cheerio');

  // const $ = cheerio.load(data.content, {decodeEntities: false});
  const siteHost = url.parse(config.url).hostname || config.url;

  data.content = data.content.replace(/<a.*?(href="(.*?)").*?>/gi, (str, hrefStr, href) => {
    if (/target=/gi.test(str)) return str;

    const data = url.parse(href);
    // Exit if the link doesn't have protocol, which means it's a internal link
    if (!data.protocol) return str;
    // Exit if the url has same host with config.ur
    if (data.hostname === siteHost) return str;

    if (/rel=/gi.test(str)) {
      str = str.replace(/rel="(.*?)"/gi, (relStr, p1) => {
        return relStr.replace(p1, `${p1} noopener`);
      });
      return str.replace(hrefStr, `${hrefStr} target="_blank"`);
    }

    return str.replace(hrefStr, `${hrefStr} target="_blank" rel="noopener"`);
  });

}

module.exports = externalLinkFilter;

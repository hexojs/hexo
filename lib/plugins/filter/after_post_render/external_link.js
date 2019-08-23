'use strict';

const url = require('url');

function externalLinkFilter(data) {
  const { config } = this;
  if (!config.external_link) return;

  const siteHost = url.parse(config.url).hostname || config.url;

  data.content = data.content.replace(/<a.*?(href=['"](.*?)['"]).*?>/gi, (str, hrefStr, href) => {
    if (/target=/gi.test(str)) return str;

    const data = url.parse(href);
    // Exit if the link doesn't have protocol, which means it's a internal link
    // Exit if the url has same host with config.url
    if (!data.protocol || data.hostname === siteHost) return str;

    if (/rel=/gi.test(str)) {
      str = str.replace(/rel="(.*?)"/gi, (relStr, rel) => {
        if (!rel.includes('noopenner')) relStr = relStr.replace(rel, `${rel} noopener`);
        return relStr;
      });
      return str.replace(hrefStr, `${hrefStr} target="_blank"`);
    }

    return str.replace(hrefStr, `${hrefStr} target="_blank" rel="noopener"`);
  });

}

module.exports = externalLinkFilter;

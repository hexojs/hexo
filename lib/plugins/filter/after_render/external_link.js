'use strict';

const { isExternalLink } = require('hexo-util');

let EXTERNAL_LINK_SITE_ENABLED = true;

function externalLinkFilter(data) {
  if (!EXTERNAL_LINK_SITE_ENABLED) return;

  const { external_link, url } = this.config;

  if (!external_link.enable || external_link.field !== 'site') {
    EXTERNAL_LINK_SITE_ENABLED = false;
    return;
  }

  return data.replace(/<a\s+(?:[^<>]+\s)?href=["']([^<>"']+)["'][^<>]*>/gi, (str, href) => {
    if (/target=/i.test(str) || !isExternalLink(href, url, external_link.exclude)) return str;

    if (/rel=/i.test(str)) {
      str = str.replace(/rel="(.*?)"/gi, (relStr, rel) => {
        return rel.includes('noopenner') ? relStr : `rel="${rel} noopener"`;
      });
      return str.replace('href=', 'target="_blank" href=');
    }

    return str.replace('href=', 'target="_blank" rel="noopener" href=');
  });
}

module.exports = externalLinkFilter;

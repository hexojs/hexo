'use strict';

const { isExternalLink } = require('hexo-util');
let EXTERNAL_LINK_POST_ENABLED = true;

function externalLinkFilter(data) {
  if (!EXTERNAL_LINK_POST_ENABLED) return;

  const { external_link, url } = this.config;

  if (!external_link.enable || external_link.field !== 'post') {
    EXTERNAL_LINK_POST_ENABLED = false;
    return;
  }

  data.content = data.content.replace(/<a\s+(?:[^<>]+\s)?href=["']([^<>"']+)["'][^<>]*>/gi, (str, href) => {
    if (/target=/gi.test(str) || !isExternalLink(href, url, external_link.exclude)) return str;

    if (/rel=/gi.test(str)) {
      str = str.replace(/rel="(.*?)"/gi, (relStr, rel) => {
        return rel.includes('noopenner') ? relStr : `rel="${rel} noopener"`;
      });
      return str.replace('href=', 'target="_blank" href=');
    }

    return str.replace('href=', 'target="_blank" rel="noopener" href=');
  });
}

module.exports = externalLinkFilter;

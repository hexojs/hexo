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

  data.content = data.content.replace(/<a(?:\s+?|\s+?[^<>]+)?href=["']([^<>"']+)["'][^<>]*>/gi, (str, href) => {
    if (!isExternalLink(href, url, external_link.exclude) || /target=/i.test(str)) return str;

    if (/rel=/i.test(str)) {
      str = str.replace(/rel=["']([^<>"']*)["']/i, (relStr, rel) => {
        return rel.includes('noopenner') ? relStr : `rel="${rel} noopener"`;
      });
      return str.replace('href=', 'target="_blank" href=');
    }

    return str.replace('href=', 'target="_blank" rel="noopener" href=');
  });
}

module.exports = externalLinkFilter;

'use strict';

const { isExternalLink } = require('hexo-util');
let EXTERNAL_LINK_POST_CONFIG;
let EXTERNAL_LINK_POST_ENABLED = true;

function externalLinkFilter(data) {
  if (!EXTERNAL_LINK_POST_ENABLED) return;

  const { config } = this;

  if (typeof EXTERNAL_LINK_POST_CONFIG === 'undefined') {
    if (typeof config.external_link === 'undefined' || typeof config.external_link === 'object'
      // Deprecated: config.external_link boolean option will be removed in future
      || config.external_link === true) {
      EXTERNAL_LINK_POST_CONFIG = Object.assign({
        enable: true,
        field: 'site',
        exclude: []
      }, config.external_link);
    }
  }

  if (config.external_link === false || EXTERNAL_LINK_POST_CONFIG.enable === false
    || EXTERNAL_LINK_POST_CONFIG.field !== 'post') {
    EXTERNAL_LINK_POST_ENABLED = false;
    return;
  }

  data.content = data.content.replace(/<a\s+(?:[^<>]+\s)?href=["']([^<>"']+)["'][^<>]*>/gi, (str, href) => {
    if (/target=/gi.test(str) || !isExternalLink(href, config.url, EXTERNAL_LINK_POST_CONFIG.exclude)) return str;

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

'use strict';

const { isExternalLink } = require('hexo-util');

function externalLinkFilter(data) {
  const { config } = this;

  if (typeof config.external_link === 'undefined' || typeof config.external_link === 'object'
    || config.external_link === true) {
    config.external_link = Object.assign({
      enable: true,
      field: 'site',
      exclude: []
    }, config.external_link);
  }
  if (config.external_link === false || config.external_link.enable === false
    || config.external_link.field !== 'post') return;

  data.content = data.content.replace(/<a([\s]+|[\s]+[^<>]+[\s]+)(href=["']([^<>"']+)["'])[^<>]*>/gi, (str, _, hrefStr, href) => {
    if (/target=/gi.test(str) || !isExternalLink(href, config.url, config.external_link.exclude)) return str;

    if (/rel=/gi.test(str)) {
      str = str.replace(/rel="(.*?)"/gi, (relStr, rel) => {
        return rel.includes('noopenner') ? relStr : `rel="${rel} noopener"`;
      });
      return str.replace(hrefStr, `${hrefStr} target="_blank"`);
    }

    return str.replace(hrefStr, `${hrefStr} target="_blank" rel="noopener"`);
  });
}

module.exports = externalLinkFilter;

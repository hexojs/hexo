'use strict';

const { Cache, isExternalLink } = require('hexo-util');
const cache = new Cache();

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
    || config.external_link.field !== 'site') return;

  const exclude = Array.isArray(config.external_link.exclude) ? config.external_link.exclude
    : [config.external_link.exclude];

  data = data.replace(/<a .*?(href=['"](.+?)['"]).*?>/gi, (str, hrefStr, href) => {
    return cache.apply(`${str}-${exclude}`, () => {
      if (/target=/gi.test(str) || !isExternalLink(href, config.url, exclude)) return str;

      if (/rel=/gi.test(str)) {
        str = str.replace(/rel="(.*?)"/gi, (relStr, rel) => {
          if (!rel.includes('noopenner')) relStr = relStr.replace(rel, `${rel} noopener`);
          return relStr;
        });
        return str.replace(hrefStr, `${hrefStr} target="_blank"`);
      }

      return str.replace(hrefStr, `${hrefStr} target="_blank" rel="noopener"`);
    });
  });

  return data;
}

module.exports = externalLinkFilter;

'use strict';

const { URL } = require('url');

const urlObj = (str) => {
  try {
    return new URL(str);
  } catch (err) {
    return str;
  }
};

/**
 * Check whether the link is external
 * @param {String} url The url to check
 * @param {Object} config The site config
 * @returns {Boolean} True if the link doesn't have protocol or link has same host with config.url
 */
const isExternal = (url, config) => {
  const exclude = Array.isArray(config.external_link.exclude) ? config.external_link.exclude :
    [config.external_link.exclude];
  const data = urlObj(url);
  const host = data.hostname;
  const sitehost = typeof urlObj(config.url) === 'object' ? urlObj(config.url).hostname : config.url;

  if (!sitehost || typeof data === 'string') return false;
  if (data.origin === 'null') return false;

  if (exclude && exclude.length) {
    for (const i of exclude) {
      if (host === i) return false;
    }
  }

  if (host !== sitehost) return true;

  return false;
};

function externalLinkFilter(data) {
  const { config } = this;

  if (typeof config.external_link === 'undefined' || typeof config.external_link === 'object' ||
    config.external_link === true) {
    config.external_link = Object.assign({
      enable: true,
      field: 'site',
      exclude: ''
    }, config.external_link);
  }
  if (config.external_link === false || config.external_link.enable === false ||
    config.external_link.field !== 'site') return;

  data = data.replace(/<a.*?(href=['"](.*?)['"]).*?>/gi, (str, hrefStr, href) => {
    if (/target=/gi.test(str) || !isExternal(href, config)) return str;

    if (/rel=/gi.test(str)) {
      str = str.replace(/rel="(.*?)"/gi, (relStr, rel) => {
        if (!rel.includes('noopenner')) relStr = relStr.replace(rel, `${rel} noopener`);
        return relStr;
      });
      return str.replace(hrefStr, `${hrefStr} target="_blank"`);
    }

    return str.replace(hrefStr, `${hrefStr} target="_blank" rel="noopener"`);
  });

  return data;
}

module.exports = externalLinkFilter;

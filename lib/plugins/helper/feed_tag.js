'use strict';

const { url_for } = require('hexo-util');
const { default: moize } = require('moize');

const feedFn = (str = '') => {
  if (str) return str.replace(/2$/, '');
  return str;
};

function makeFeedTag(path, options = {}, configFeed, configTitle) {
  const title = options.title || configTitle;

  if (path) {
    if (typeof path !== 'string') throw new TypeError('path must be a string!');

    let type = feedFn(options.type);

    if (!type) {
      if (path.includes('atom')) type = 'atom';
      else if (path.includes('rss')) type = 'rss';
    }

    const typeAttr = type ? `type="application/${type}+xml"` : '';

    return `<link rel="alternate" href="${url_for.call(this, path)}" title="${title}" ${typeAttr}>`;
  }

  if (configFeed) {
    if (configFeed.type && configFeed.path) {
      if (typeof configFeed.type === 'string') {
        return `<link rel="alternate" href="${url_for.call(this, configFeed.path)}" title="${title}" type="application/${feedFn(configFeed.type)}+xml">`;
      }

      let result = '';
      for (const i in configFeed.type) {
        result += `<link rel="alternate" href="${url_for.call(this, configFeed.path[i])}" title="${title}" type="application/${feedFn(configFeed.type[i])}+xml">`;
      }
      return result;
    }
  }

  return '';
}

function feedTagHelper(path, options = {}) {
  const { config } = this;
  return moize.deep(makeFeedTag.bind(this))(path, options, config.feed, config.title);
}

module.exports = feedTagHelper;

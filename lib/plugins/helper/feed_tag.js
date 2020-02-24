'use strict';

const feedFn = (str = '') => {
  if (str) return str.replace(/2$/, '');
  return str;
};

function feedTagHelper(path, options = {}) {
  const { config } = this;
  const title = options.title || config.title;

  if (path) {
    if (typeof path !== 'string') throw new TypeError('path must be a string!');

    let type = feedFn(options.type);

    if (!type) {
      if (path.includes('atom')) type = 'atom';
      else if (path.includes('rss')) type = 'rss';
    }

    const typeAttr = type ? `type="application/${type}+xml"` : '';

    return `<link rel="alternate" href="${this.url_for(path)}" title="${title}" ${typeAttr}>`;
  }

  if (config.feed) {
    const { feed } = config;
    if (feed.type && feed.path) {
      if (typeof feed.type === 'string') {
        return `<link rel="alternate" href="${this.url_for(feed.path)}" title="${title}" type="application/${feedFn(feed.type)}+xml">`;
      }

      let result = '';
      for (const i in feed.type) {
        result += `<link rel="alternate" href="${this.url_for(feed.path[i])}" title="${title}" type="application/${feedFn(feed.type[i])}+xml">`;
      }
      return result;
    }
  }

  return '';
}

module.exports = feedTagHelper;

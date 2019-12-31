'use strict';

function feedTagHelper(path, options = {}) {
  const { config } = this;
  const title = options.title || config.title;

  if (path) {
    if (typeof path !== 'string') throw new TypeError('path must be a string!');

    const { type } = options;
    let typeAttr = '';

    if (type === 'atom' || path.includes('atom')) typeAttr = 'type="application/atom+xml"';
    else if (type.includes('rss') || path.includes('rss')) typeAttr = 'type="application/rss+xml"';

    return `<link rel="alternate" href="${this.url_for(path)}" title="${title}" ${typeAttr}>`;
  }

  if (!path && config.feed) {
    const { feed } = config;
    if (feed.type && feed.path) {
      if (typeof feed.type === 'string') {
        return `<link rel="alternate" href="${this.url_for(feed.path)}" title="${title}" type="application/${feed.type.replace(/2$/, '')}+xml">`;
      }

      let result = '';
      for (const i in feed.type) {
        result += `<link rel="alternate" href="${this.url_for(feed.path[i])}" title="${title}" type="application/${feed.type[i].replace(/2$/, '')}+xml">`;
      }
      return result;
    }
  }

  return '';
}

module.exports = feedTagHelper;

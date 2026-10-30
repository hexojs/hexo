import { url_for } from 'hexo-util';
import moize from 'moize';
import type { LocalsType } from '../../types';

const feedFn = (str = '') => {
  if (str) return str.replace(/2$/, '');
  return str;
};

interface Options {
  title?: string;
  type?: string | null;
}

function makeFeedTag(this: LocalsType, path?: string, options: Options = {}, configFeed?: any, configTitle?: string) {
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

const memoized = moize.deep(makeFeedTag, {
  maxSize: 10
});

function feedTagHelper(this: LocalsType, path?: string, options: Options = {}) {
  const { config } = this;

  if (config.relative_link) {
    return makeFeedTag.call(this, path, options, (config as any).feed, config.title);
  }

  return memoized.call(this, path, options, (config as any).feed, config.title);
}

export = feedTagHelper;

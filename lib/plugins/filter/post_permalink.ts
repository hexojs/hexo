import { createSha1Hash, Permalink, slugize } from 'hexo-util';
import { basename } from 'path';
import type Hexo from '../../hexo';
import type { PostSchema } from '../../types';

import { defineLazyProperty } from 'foxts/define-lazy-property';

let permalink: Permalink;

function postPermalinkFilter(this: Hexo, data: PostSchema): string {
  const { config } = this;
  const { id, _id, slug, title, date } = data;
  let { __permalink } = data;
  const { post_asset_folder } = config;

  if (__permalink) {
    if (post_asset_folder && !__permalink.endsWith('/') && !__permalink.endsWith('.html')) {
      __permalink += '/';
    }
    if (!__permalink.startsWith('/')) return `/${__permalink}`;
    return __permalink;
  }

  const meta = {
    id: id || _id,
    title: slug,
    name: typeof slug === 'string' ? basename(slug) : ''
  };

  defineLazyProperty(
    meta, 'hash',
    () => {
      return slug && date
        ? createSha1Hash().update(slug + date.unix().toString()).digest('hex').slice(0, 12)
        : null;
    }
  );
  defineLazyProperty(
    meta, 'post_title',
    () => slugize(title, { transform: 1 })
  );
  defineLazyProperty(
    meta, 'year',
    () => date.format('YYYY')
  );
  defineLazyProperty(
    meta, 'month',
    () => date.format('MM')
  );
  defineLazyProperty(
    meta, 'day',
    () => date.format('DD')
  );
  defineLazyProperty(
    meta, 'hour',
    () => date.format('HH')
  );
  defineLazyProperty(
    meta, 'minute',
    () => date.format('mm')
  );
  defineLazyProperty(
    meta, 'second',
    () => date.format('ss')
  );
  defineLazyProperty(
    meta, 'i_month',
    () => date.format('M')
  );
  defineLazyProperty(
    meta, 'i_day',
    () => date.format('D')
  );
  defineLazyProperty(
    meta, 'timestamp',
    () => date.format('X')
  );

  defineLazyProperty(
    meta, 'categories',
    () => {
      if (data.categories.length) {
        return data.categories.last().slug;
      }
      return config.default_category;
    }
  );

  if (!permalink || permalink.rule !== config.permalink) {
    permalink = new Permalink(config.permalink, {});
  }

  const keys = Object.keys(data);

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(meta, key)) continue;

    // Use Object.getOwnPropertyDescriptor to copy getters to avoid "Maximum call
    // stack size exceeded" error
    Object.defineProperty(meta, key, Object.getOwnPropertyDescriptor(data, key));
  }

  if (config.permalink_defaults) {
    const keys2 = Object.keys(config.permalink_defaults);

    for (const key of keys2) {
      if (Object.prototype.hasOwnProperty.call(meta, key)) continue;

      meta[key] = config.permalink_defaults[key];
    }
  }

  const permalink_stringify = permalink.stringify(meta);
  if (post_asset_folder && !permalink_stringify.endsWith('/') && !permalink_stringify.endsWith('.html')) {
    return `${permalink_stringify}/`;
  }
  return permalink_stringify;
}

export = postPermalinkFilter;

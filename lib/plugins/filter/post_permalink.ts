import { createSha1Hash, Permalink, slugize } from 'hexo-util';
import { basename } from 'path';
import type Hexo from '../../hexo';
let permalink;

function postPermalinkFilter(this: Hexo, data) {
  const { config } = this;
  const { id, _id, slug, title, date, __permalink } = data;

  if (__permalink) {
    if (!__permalink.startsWith('/')) return `/${__permalink}`;
    return __permalink;
  }

  const hash = slug && date
    ? createSha1Hash().update(slug + date.unix().toString()).digest('hex').slice(0, 12)
    : null;
  const meta = {
    id: id || _id,
    title: slug,
    name: typeof slug === 'string' ? basename(slug) : '',
    post_title: slugize(title, {transform: 1}),
    year: date.format('YYYY'),
    month: date.format('MM'),
    day: date.format('DD'),
    hour: date.format('HH'),
    minute: date.format('mm'),
    second: date.format('ss'),
    i_month: date.format('M'),
    i_day: date.format('D'),
    hash,
    category: config.default_category
  };

  if (!permalink || permalink.rule !== config.permalink) {
    permalink = new Permalink(config.permalink, {});
  }

  const { categories } = data;

  if (categories.length) {
    meta.category = categories.last().slug;
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

  return permalink.stringify(meta);
}

export = postPermalinkFilter;

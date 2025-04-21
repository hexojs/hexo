import type Query from 'warehouse/dist/query';
import type { LocalsType, PostSchema } from '../../types';
import { toMomentLocale } from './date';
import { url_for, Cache } from 'hexo-util';

interface Options {
  format?: string;
  type?: string;
  style?: string | false;
  transform?: (name: string) => string;
  separator?: string;
  show_count?: boolean;
  class?: string;
  order?: number;
}

interface Data {
  name: string;
  year: number;
  month: number;
  count: number;
}

const postsCache = new Cache();

function listArchivesHelper(this: LocalsType, options: Options = {}) {
  const { config } = this;
  const archiveDir = config.archive_dir;
  const { timezone } = config;
  const lang = toMomentLocale(this.page.lang || this.page.language || config.language);
  let { format } = options;
  const type = options.type || 'monthly';
  const { style = 'list', transform, separator = ', ' } = options;
  const showCount = Object.prototype.hasOwnProperty.call(options, 'show_count') ? options.show_count : true;
  const className = options.class || 'archive';
  const order = options.order || -1;
  const compareFunc = type === 'monthly'
    ? (yearA, monthA, yearB, monthB) => yearA === yearB && monthA === monthB
    : (yearA, _monthA, yearB, _monthB) => yearA === yearB;

  let result = '';

  if (!format) {
    format = type === 'monthly' ? 'MMMM YYYY' : 'YYYY';
  }

  const posts = config.relative_link ? postsCache.apply(`date-${order}`, () => this.site.posts.sort('date', order)) as Query<PostSchema> : this.site.posts.sort('date', order);
  if (!posts.length) return result;

  const data: Data[] = [];
  let length = 0;

  posts.forEach(post => {
    // Clone the date object to avoid pollution
    let date = post.date.clone();

    if (timezone) date = date.tz(timezone);

    const year = date.year();
    const month = date.month() + 1;
    const lastData = data[length - 1];

    if (!lastData || !compareFunc(lastData.year, lastData.month, year, month)) {
      if (lang) date = date.locale(lang);
      const name = date.format(format);
      length = data.push({
        name,
        year,
        month,
        count: 1
      });
    } else {
      lastData.count++;
    }
  });

  const link = item => {
    let url = `${archiveDir}/${item.year}/`;

    if (type === 'monthly') {
      if (item.month < 10) url += '0';
      url += `${item.month}/`;
    }

    return url_for.call(this, url);
  };

  if (style === 'list') {
    result += `<ul class="${className}-list">`;

    for (let i = 0, len = data.length; i < len; i++) {
      const item = data[i];

      result += `<li class="${className}-list-item">`;

      result += `<a class="${className}-list-link" href="${link(item)}">`;
      result += transform ? transform(item.name) : item.name;
      result += '</a>';

      if (showCount) {
        result += `<span class="${className}-list-count">${item.count}</span>`;
      }

      result += '</li>';
    }

    result += '</ul>';
  } else {
    for (let i = 0, len = data.length; i < len; i++) {
      const item = data[i];

      if (i) result += separator;

      result += `<a class="${className}-link" href="${link(item)}">`;
      result += transform ? transform(item.name) : item.name;

      if (showCount) {
        result += `<span class="${className}-count">${item.count}</span>`;
      }

      result += '</a>';
    }
  }

  return result;
}

export = listArchivesHelper;

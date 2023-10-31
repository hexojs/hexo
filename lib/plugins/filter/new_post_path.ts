import { join, extname } from 'path';
import moment from 'moment';
import Promise from 'bluebird';
import { createSha1Hash, Permalink } from 'hexo-util';
import { ensurePath } from 'hexo-fs';
import type Hexo from '../../hexo';
let permalink;

const reservedKeys = {
  year: true,
  month: true,
  i_month: true,
  day: true,
  i_day: true,
  title: true,
  hash: true
};

interface Data {
  path?: string;
  layout?: string;
  slug?: string;
  date?: Date;
}

function newPostPathFilter(this: Hexo, data: Data = {}, replace): Promise<string> {
  const sourceDir = this.source_dir;
  const draftDir = join(sourceDir, '_drafts');
  const postDir = join(sourceDir, '_posts');
  const { config } = this;
  const newPostName = config.new_post_name;
  const permalinkDefaults = config.permalink_defaults;
  const { path, layout, slug } = data;

  if (!permalink || permalink.rule !== newPostName) {
    permalink = new Permalink(newPostName, {});
  }

  let target = '';

  if (path) {
    switch (layout) {
      case 'page':
        target = join(sourceDir, path);
        break;

      case 'draft':
        target = join(draftDir, path);
        break;

      default:
        target = join(postDir, path);
    }
  } else if (slug) {
    switch (layout) {
      case 'page':
        target = join(sourceDir, slug, 'index');
        break;

      case 'draft':
        target = join(draftDir, slug);
        break;

      default: {
        const date = moment(data.date || Date.now());
        const keys = Object.keys(data);
        const hash = createSha1Hash().update(slug + date.unix().toString())
          .digest('hex').slice(0, 12);

        const filenameData = {
          year: date.format('YYYY'),
          month: date.format('MM'),
          i_month: date.format('M'),
          day: date.format('DD'),
          i_day: date.format('D'),
          title: slug,
          hash
        };

        for (let i = 0, len = keys.length; i < len; i++) {
          const key = keys[i];
          if (!reservedKeys[key]) filenameData[key] = data[key];
        }

        target = join(postDir, permalink.stringify({
          ...permalinkDefaults,
          ...filenameData
        }));
      }
    }
  } else {
    return Promise.reject(new TypeError('Either data.path or data.slug is required!'));
  }

  if (!extname(target)) {
    target += extname(newPostName) || '.md';
  }

  if (replace) {
    return Promise.resolve(target);
  }

  return ensurePath(target);
}

export = newPostPathFilter;

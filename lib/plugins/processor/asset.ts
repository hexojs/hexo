import { adjustDateForTimezone, toDate, isExcludedFile, isMatch } from './common';
import Promise from 'bluebird';
import { parse as yfm } from 'hexo-front-matter';
import { extname, relative } from 'path';
import { Pattern } from 'hexo-util';
import { magenta } from 'picocolors';
import type { _File } from '../../box';
import type Hexo from '../../hexo';
import type { Stats } from 'fs';
import { PageSchema } from '../../types';

export = (ctx: Hexo) => {
  return {
    pattern: new Pattern(path => {
      if (isExcludedFile(path, ctx.config)) return;

      return {
        renderable: ctx.render.isRenderable(path) && !isMatch(path, ctx.config.skip_render)
      };
    }),

    process: function assetProcessor(file: _File) {
      if (file.params.renderable) {
        return processPage(ctx, file);
      }

      return processAsset(ctx, file);
    }
  };
};

function processPage(ctx: Hexo, file: _File) {
  const Page = ctx.model('Page');
  const { path } = file;
  const doc = Page.findOne({source: path});
  const { config } = ctx;
  const { timezone } = config;
  const updated_option = config.updated_option;

  if (file.type === 'skip' && doc) {
    return;
  }

  if (file.type === 'delete') {
    if (doc) {
      return doc.remove();
    }

    return;
  }

  return Promise.all([
    file.stat(),
    file.read()
  ]).spread((stats: Stats, content: string) => {
    const data: PageSchema = yfm(content);
    const output = ctx.render.getOutput(path);

    data.source = path;
    data.raw = content;

    data.date = toDate(data.date) as any;

    if (data.date) {
      if (timezone) data.date = adjustDateForTimezone(data.date, timezone) as any;
    } else {
      data.date = stats.ctime as any;
    }

    data.updated = toDate(data.updated) as any;

    if (data.updated) {
      if (timezone) data.updated = adjustDateForTimezone(data.updated, timezone) as any;
    } else if (updated_option === 'date') {
      data.updated = data.date;
    } else if (updated_option === 'empty') {
      data.updated = undefined;
    } else {
      data.updated = stats.mtime as any;
    }

    if (data.permalink) {
      data.path = data.permalink;
      data.permalink = undefined;

      if (data.path.endsWith('/')) {
        data.path += 'index';
      }

      if (!extname(data.path)) {
        data.path += `.${output}`;
      }
    } else {
      data.path = `${path.substring(0, path.length - extname(path).length)}.${output}`;
    }

    if (!data.layout && output !== 'html' && output !== 'htm') {
      data.layout = false;
    }

    if (doc) {
      if (file.type !== 'update') {
        ctx.log.warn(`Trying to "create" ${magenta(file.path)}, but the file already exists!`);
      }
      return doc.replace(data);
    }

    return Page.insert(data);
  });
}

function processAsset(ctx: Hexo, file: _File) {
  const id = relative(ctx.base_dir, file.source).replace(/\\/g, '/');
  const Asset = ctx.model('Asset');
  const doc = Asset.findById(id);

  if (file.type === 'delete') {
    if (doc) {
      return doc.remove();
    }

    return;
  }

  return Asset.save({
    _id: id,
    path: file.path,
    modified: file.type !== 'skip',
    renderable: file.params.renderable
  });
}

'use strict';

const { timezone, toDate, isExcludedFile, isMatch } = require('./common');
const Promise = require('bluebird');
const { parse: yfm } = require('hexo-front-matter');
const { extname, relative } = require('path');
const { Pattern } = require('hexo-util');
const { magenta } = require('picocolors');

module.exports = ctx => {
  return {
    pattern: new Pattern(path => {
      if (isExcludedFile(path, ctx.config)) return;

      return {
        renderable: ctx.render.isRenderable(path) && !isMatch(path, ctx.config.skip_render)
      };
    }),

    process: function assetProcessor(file) {
      if (file.params.renderable) {
        return processPage(ctx, file);
      }

      return processAsset(ctx, file);
    }
  };
};

function processPage(ctx, file) {
  const Page = ctx.model('Page');
  const { path } = file;
  const doc = Page.findOne({source: path});
  const { config } = ctx;
  const { timezone: timezoneCfg } = config;
  // Deprecated: use_date_for_updated will be removed in future
  const updated_option = config.use_date_for_updated === true ? 'date' : config.updated_option;

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
  ]).spread((stats, content) => {
    const data = yfm(content);
    const output = ctx.render.getOutput(path);

    data.source = path;
    data.raw = content;

    data.date = toDate(data.date);

    if (data.date) {
      if (timezoneCfg) data.date = timezone(data.date, timezoneCfg);
    } else {
      data.date = stats.ctime;
    }

    data.updated = toDate(data.updated);

    if (data.updated) {
      if (timezoneCfg) data.updated = timezone(data.updated, timezoneCfg);
    } else if (updated_option === 'date') {
      data.updated = data.date;
    } else if (updated_option === 'empty') {
      data.updated = undefined;
    } else {
      data.updated = stats.mtime;
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

function processAsset(ctx, file) {
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

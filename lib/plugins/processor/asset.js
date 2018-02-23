'use strict';

const common = require('./common');
const Promise = require('bluebird');
const yfm = require('hexo-front-matter');
const pathFn = require('path');
const util = require('hexo-util');
const Pattern = util.Pattern;

module.exports = ctx => {
  function processPage(file) {
    const Page = ctx.model('Page');
    const path = file.path;
    const doc = Page.findOne({source: path});
    const config = ctx.config;
    const timezone = config.timezone;

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

      data.date = common.toDate(data.date);

      if (data.date) {
        if (timezone) data.date = common.timezone(data.date, timezone);
      } else {
        data.date = stats.ctime;
      }

      data.updated = common.toDate(data.updated);

      if (data.updated) {
        if (timezone) data.updated = common.timezone(data.updated, timezone);
      } else {
        data.updated = stats.mtime;
      }

      if (data.permalink) {
        data.path = data.permalink;
        delete data.permalink;

        if (data.path[data.path.length - 1] === '/') {
          data.path += 'index';
        }

        if (!pathFn.extname(data.path)) {
          data.path += `.${output}`;
        }
      } else {
        const extname = pathFn.extname(path);
        data.path = `${path.substring(0, path.length - extname.length)}.${output}`;
      }

      if (!data.layout && output !== 'html' && output !== 'htm') {
        data.layout = false;
      }

      // FIXME: Data may be inserted when reading files. Load it again to prevent
      // race condition. We have to solve this in warehouse.
      const doc = Page.findOne({source: path});

      if (doc) {
        return doc.replace(data);
      }

      return Page.insert(data);
    });
  }

  function processAsset(file) {
    const id = file.source.substring(ctx.base_dir.length).replace(/\\/g, '/');
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

  return {
    pattern: new Pattern(path => {
      if (common.isTmpFile(path) || common.isMatch(path, ctx.config.exclude)) return;

      if (common.isHiddenFile(path) && !common.isMatch(path, ctx.config.include)) {
        return;
      }

      return {
        renderable: ctx.render.isRenderable(path) && !common.isMatch(path, ctx.config.skip_render)
      };
    }),

    process: function assetProcessor(file) {
      if (file.params.renderable) {
        return processPage(file);
      }

      return processAsset(file);
    }
  };
};

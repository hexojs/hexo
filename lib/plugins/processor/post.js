'use strict';

const common = require('./common');
const Promise = require('bluebird');
const yfm = require('hexo-front-matter');
const { extname, join } = require('path');
const fs = require('hexo-fs');
const { slugize, Pattern, Permalink } = require('hexo-util');

const postDir = '_posts/';
const draftDir = '_drafts/';
let permalink;

const preservedKeys = {
  title: true,
  year: true,
  month: true,
  day: true,
  i_month: true,
  i_day: true
};

module.exports = ctx => {
  function processPost(file) {
    const Post = ctx.model('Post');
    const { path } = file.params;
    const doc = Post.findOne({source: file.path});
    const { config } = ctx;
    const { timezone } = config;
    let categories, tags;

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
      const info = parseFilename(config.new_post_name, path);
      const keys = Object.keys(info);

      data.source = file.path;
      data.raw = content;
      data.slug = info.title;

      if (file.params.published) {
        if (!data.hasOwnProperty('published')) data.published = true;
      } else {
        data.published = false;
      }

      for (let i = 0, len = keys.length; i < len; i++) {
        const key = keys[i];
        if (!preservedKeys[key]) data[key] = info[key];
      }

      if (data.date) {
        data.date = common.toDate(data.date);
      } else if (info && info.year && (info.month || info.i_month) && (info.day || info.i_day)) {
        data.date = new Date(
          info.year,
          parseInt(info.month || info.i_month, 10) - 1,
          parseInt(info.day || info.i_day, 10)
        );
      }

      if (data.date) {
        if (timezone) data.date = common.timezone(data.date, timezone);
      } else {
        data.date = stats.birthtime;
      }

      data.updated = common.toDate(data.updated);

      if (data.updated) {
        if (timezone) data.updated = common.timezone(data.updated, timezone);
      } else {
        data.updated = stats.mtime;
      }

      if (data.category && !data.categories) {
        data.categories = data.category;
        delete data.category;
      }

      if (data.tag && !data.tags) {
        data.tags = data.tag;
        delete data.tag;
      }

      categories = data.categories || [];
      tags = data.tags || [];

      if (!Array.isArray(categories)) categories = [categories];
      if (!Array.isArray(tags)) tags = [tags];

      if (data.photo && !data.photos) {
        data.photos = data.photo;
        delete data.photo;
      }

      if (data.photos && !Array.isArray(data.photos)) {
        data.photos = [data.photos];
      }

      if (data.link && !data.title) {
        data.title = data.link.replace(/^https?:\/\/|\/$/g, '');
      }

      if (data.permalink) {
        data.slug = data.permalink;
        delete data.permalink;
      }

      // FIXME: Data may be inserted when reading files. Load it again to prevent
      // race condition. We have to solve this in warehouse.
      const doc = Post.findOne({source: file.path});

      if (doc) {
        return doc.replace(data);
      }

      return Post.insert(data);
    }).then(doc => Promise.all([
      doc.setCategories(categories),
      doc.setTags(tags),
      scanAssetDir(doc)
    ]));
  }

  function scanAssetDir(post) {
    if (!ctx.config.post_asset_folder) return;

    const assetDir = post.asset_dir;
    const baseDir = ctx.base_dir;
    const baseDirLength = baseDir.length;
    const PostAsset = ctx.model('PostAsset');

    return fs.stat(assetDir).then(stats => {
      if (!stats.isDirectory()) return [];

      return fs.listDir(assetDir);
    }).catch(err => {
      if (err.cause && err.cause.code === 'ENOENT') return [];
      throw err;
    }).filter(item => !common.isTmpFile(item) && !common.isHiddenFile(item)).map(item => {
      const id = join(assetDir, item).substring(baseDirLength).replace(/\\/g, '/');
      const asset = PostAsset.findById(id);
      if (asset) return undefined;

      return PostAsset.save({
        _id: id,
        post: post._id,
        slug: item,
        modified: true
      });
    });
  }

  function processAsset(file) {
    const PostAsset = ctx.model('PostAsset');
    const Post = ctx.model('Post');
    const id = file.source.substring(ctx.base_dir.length).replace(/\\/g, '/');
    const doc = PostAsset.findById(id);

    if (file.type === 'delete') {
      if (doc) {
        return doc.remove();
      }

      return;
    }

    // TODO: Better post searching
    const post = Post.toArray().find(post => file.source.startsWith(post.asset_dir));

    if (post != null) {
      return PostAsset.save({
        _id: id,
        slug: file.source.substring(post.asset_dir.length),
        post: post._id,
        modified: file.type !== 'skip',
        renderable: file.params.renderable
      });
    }

    if (doc) {
      return doc.remove();
    }
  }

  return {
    pattern: new Pattern(path => {
      if (common.isTmpFile(path)) return;

      let result;

      if (path.startsWith(postDir)) {
        result = {
          published: true,
          path: path.substring(postDir.length)
        };
      } else if (path.startsWith(draftDir)) {
        result = {
          published: false,
          path: path.substring(draftDir.length)
        };
      }

      if (!result || common.isHiddenFile(result.path)) return;

      result.renderable = ctx.render.isRenderable(path) && !common.isMatch(path, ctx.config.skip_render);
      return result;
    }),

    process: function postProcessor(file) {
      if (file.params.renderable) {
        return processPost(file);
      } else if (ctx.config.post_asset_folder) {
        return processAsset(file);
      }
    }
  };
};

function parseFilename(config, path) {
  config = config.substring(0, config.length - extname(config).length);
  path = path.substring(0, path.length - extname(path).length);

  if (!permalink || permalink.rule !== config) {
    permalink = new Permalink(config, {
      segments: {
        year: /(\d{4})/,
        month: /(\d{2})/,
        day: /(\d{2})/,
        i_month: /(\d{1,2})/,
        i_day: /(\d{1,2})/
      }
    });
  }

  const data = permalink.parse(path);

  if (data) {
    return data;
  }

  return {
    title: slugize(path)
  };
}

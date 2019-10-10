'use strict';

const assert = require('assert');
const moment = require('moment');
const Promise = require('bluebird');
const { join, extname } = require('path');
const assignIn = require('lodash/assignIn');
const clone = require('lodash/clone');
const chalk = require('chalk');
const yaml = require('js-yaml');
const { slugize, escapeRegExp } = require('hexo-util');
const fs = require('hexo-fs');
const yfm = require('hexo-front-matter');

const preservedKeys = ['title', 'slug', 'path', 'layout', 'date', 'content'];

function PostRenderCache() {
  this.cache = [];
}

const _escapeContent = (cache, str) => {
  const placeholder = '\uFFFC';
  return `<!--${placeholder}${cache.push(str) - 1}-->`;
};

PostRenderCache.prototype.escapeContent = function(str) {
  const rEscapeContent = /<escape(?:[^>]*)>([\s\S]*?)<\/escape>/g;
  return str.replace(rEscapeContent, (_, content) => _escapeContent(this.cache, content));
};

PostRenderCache.prototype.loadContent = function(str) {
  const rPlaceholder = /(?:<|&lt;)!--\uFFFC(\d+)--(?:>|&gt;)/g;
  const restored = str.replace(rPlaceholder, (_, index) => {
    assert(this.cache[index]);
    const value = this.cache[index];
    this.cache[index] = null;
    return value;
  });
  if (restored === str) return restored;
  return this.loadContent(restored); // self-recursive for nexted escaping
};

PostRenderCache.prototype.escapeAllSwigTags = function(str) {
  const rSwigVar = /\{\{[\s\S]*?\}\}/g;
  const rSwigComment = /\{#[\s\S]*?#\}/g;
  const rSwigBlock = /\{%[\s\S]*?%\}/g;
  const rSwigFullBlock = /\{% *(.+?)(?: *| +.*)%\}[\s\S]+?\{% *end\1 *%\}/g;

  const escape = _str => _escapeContent(this.cache, _str);
  return str.replace(rSwigFullBlock, escape)
    .replace(rSwigBlock, escape)
    .replace(rSwigComment, '')
    .replace(rSwigVar, escape);
};

function Post(context) {
  this.context = context;
}

Post.prototype.create = function(data, replace, callback) {
  if (!callback && typeof replace === 'function') {
    callback = replace;
    replace = false;
  }

  const ctx = this.context;
  const { config } = ctx;

  data.slug = slugize((data.slug || data.title).toString(), {transform: config.filename_case});
  data.layout = (data.layout || config.default_layout).toLowerCase();
  data.date = data.date ? moment(data.date) : moment();

  return Promise.all([
    // Get the post path
    ctx.execFilter('new_post_path', data, {
      args: [replace],
      context: ctx
    }),
    this._renderScaffold(data)
  ]).spread((path, content) => {
    const result = { path, content };

    return Promise.all([
      // Write content to file
      fs.writeFile(path, content),
      // Create asset folder
      createAssetFolder(path, config.post_asset_folder)
    ]).then(() => {
      ctx.emit('new', result);
    }).thenReturn(result);
  }).asCallback(callback);
};

function prepareFrontMatter(data) {
  for (const key of Object.keys(data)) {
    const item = data[key];

    if (moment.isMoment(item)) {
      data[key] = item.utc().format('YYYY-MM-DD HH:mm:ss');
    } else if (moment.isDate(item)) {
      data[key] = moment.utc(item).format('YYYY-MM-DD HH:mm:ss');
    } else if (typeof item === 'string') {
      data[key] = `"${item}"`;
    }
  }

  return data;
}

Post.prototype._getScaffold = function(layout) {
  const ctx = this.context;

  return ctx.scaffold.get(layout).then(result => {
    if (result != null) return result;
    return ctx.scaffold.get('normal');
  });
};

Post.prototype._renderScaffold = function(data) {
  const { tag } = this.context.extend;
  let yfmSplit;

  return this._getScaffold(data.layout).then(scaffold => {
    const frontMatter = prepareFrontMatter(clone(data));
    yfmSplit = yfm.split(scaffold);

    return tag.render(yfmSplit.data, frontMatter);
  }).then(frontMatter => {
    const { separator } = yfmSplit;
    const jsonMode = separator[0] === ';';

    // Parse front-matter
    const obj = jsonMode ? JSON.parse(`{${frontMatter}}`) : yaml.load(frontMatter);

    // Add data which are not in the front-matter
    for (const key of Object.keys(data)) {
      if (!preservedKeys.includes(key) && obj[key] == null) {
        obj[key] = data[key];
      }
    }

    let content = '';
    // Prepend the separator
    if (yfmSplit.prefixSeparator) content += `${separator}\n`;

    content += yfm.stringify(obj, {
      mode: jsonMode ? 'json' : ''
    });

    // Concat content
    content += yfmSplit.content;

    if (data.content) {
      content += `\n${data.content}`;
    }

    return content;
  });
};

function createAssetFolder(path, assetFolder) {
  if (!assetFolder) return Promise.resolve();

  const target = removeExtname(path);

  return fs.exists(target).then(exist => {
    if (!exist) return fs.mkdirs(target);
  });
}

function removeExtname(str) {
  return str.substring(0, str.length - extname(str).length);
}

Post.prototype.publish = function(data, replace, callback) {
  if (!callback && typeof replace === 'function') {
    callback = replace;
    replace = false;
  }

  if (data.layout === 'draft') data.layout = 'post';

  const ctx = this.context;
  const { config } = ctx;
  const draftDir = join(ctx.source_dir, '_drafts');
  const slug = data.slug = slugize(data.slug.toString(), {transform: config.filename_case});
  const regex = new RegExp(`^${escapeRegExp(slug)}(?:[^\\/\\\\]+)`);
  let src = '';
  const result = {};

  data.layout = (data.layout || config.default_layout).toLowerCase();

  // Find the draft
  return fs.listDir(draftDir).then(list => {
    return list.find(item => regex.test(item));
  }).then(item => {
    if (!item) throw new Error(`Draft "${slug}" does not exist.`);

    // Read the content
    src = join(draftDir, item);
    return fs.readFile(src);
  }).then(content => {
    // Create post
    assignIn(data, yfm(content));
    data.content = data._content;
    delete data._content;

    return this.create(data, replace).then(post => {
      result.path = post.path;
      result.content = post.content;
    });
  }).then(() => // Remove the original draft file
    fs.unlink(src)).then(() => {
    if (!config.post_asset_folder) return;

    // Copy assets
    const assetSrc = removeExtname(src);
    const assetDest = removeExtname(result.path);

    return fs.exists(assetSrc).then(exist => {
      if (!exist) return;

      return fs.copyDir(assetSrc, assetDest).then(() => fs.rmdir(assetSrc));
    });
  }).thenReturn(result).asCallback(callback);
};

Post.prototype.render = function(source, data = {}, callback) {
  const ctx = this.context;
  const { config } = ctx;
  const { tag } = ctx.extend;
  const ext = data.engine || (source ? extname(source) : '');

  let promise;

  if (data.content != null) {
    promise = Promise.resolve(data.content);
  } else if (source) {
    // Read content from files
    promise = fs.readFile(source);
  } else {
    return Promise.reject(new Error('No input file or string!')).asCallback(callback);
  }

  const isSwig = ext === 'swig';

  // disable Nunjucks when the renderer spcify that.
  const disableNunjucks = ext && ctx.render.renderer.get(ext) && !!ctx.render.renderer.get(ext).disableNunjucks;

  const cacheObj = new PostRenderCache();

  return promise.then(content => {
    data.content = content;

    // Run "before_post_render" filters
    return ctx.execFilter('before_post_render', data, {context: ctx});
  }).then(() => {
    data.content = cacheObj.escapeContent(data.content);

    if (isSwig) {
      // Render with Nunjucks if this is a swig file
      return tag.render(data.content, data);
    }

    // Escape all Swig tags
    if (!disableNunjucks) {
      data.content = cacheObj.escapeAllSwigTags(data.content);
    }

    const options = data.markdown || {};
    if (!config.highlight.enable) options.highlight = null;

    ctx.log.debug('Rendering post: %s', chalk.magenta(source));
    // Render with markdown or other renderer
    return ctx.render.render({
      text: data.content,
      path: source,
      engine: data.engine,
      toString: true,
      onRenderEnd(content) {
        // Replace cache data with real contents
        data.content = cacheObj.loadContent(content);

        // Return content after replace the placeholders
        if (disableNunjucks) return data.content;

        // Render with Nunjucks
        return tag.render(data.content, data);
      }
    }, options);
  }).then(content => {
    data.content = content;

    // Run "after_post_render" filters
    return ctx.execFilter('after_post_render', data, {context: ctx});
  }).asCallback(callback);
};

module.exports = Post;

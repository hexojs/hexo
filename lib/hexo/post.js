'use strict';

const moment = require('moment');
const Promise = require('bluebird');
const pathFn = require('path');
const _ = require('lodash');
const yaml = require('js-yaml');
const { slugize, escapeRegExp } = require('hexo-util');
const fs = require('hexo-fs');
const yfm = require('hexo-front-matter');

const rEscapeContent = /<escape(?:[^>]*)>([\s\S]*?)<\/escape>/g;
const rSwigVar = /\{\{[\s\S]*?\}\}/g;
const rSwigComment = /\{#[\s\S]*?#\}/g;
const rSwigBlock = /\{%[\s\S]*?%\}/g;
const rSwigFullBlock = /\{% *(.+?)(?: *| +.*)%\}[\s\S]+?\{% *end\1 *%\}/g;
const placeholder = '\uFFFC';
const rPlaceholder = /(?:<|&lt;)!--\uFFFC(\d+)--(?:>|&gt;)/g;

const preservedKeys = ['title', 'slug', 'path', 'layout', 'date', 'content'];

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
  const tag = this.context.extend.tag;
  let yfmSplit;

  return this._getScaffold(data.layout).then(scaffold => {
    const frontMatter = prepareFrontMatter(_.clone(data));
    yfmSplit = yfm.split(scaffold);

    return tag.render(yfmSplit.data, frontMatter);
  }).then(frontMatter => {
    const separator = yfmSplit.separator;
    const jsonMode = separator[0] === ';';
    let obj;

    // Parse front-matter
    if (jsonMode) {
      obj = JSON.parse(`{${frontMatter}}`);
    } else {
      obj = yaml.load(frontMatter);
    }

    // Add data which are not in the front-matter
    for (const key of Object.keys(data)) {
      if (!_.includes(preservedKeys, key) && obj[key] == null) {
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
  return str.substring(0, str.length - pathFn.extname(str).length);
}

Post.prototype.publish = function(data, replace, callback) {
  if (!callback && typeof replace === 'function') {
    callback = replace;
    replace = false;
  }

  if (data.layout === 'draft') data.layout = 'post';

  const ctx = this.context;
  const { config } = ctx;
  const draftDir = pathFn.join(ctx.source_dir, '_drafts');
  const slug = data.slug = slugize(data.slug.toString(), {transform: config.filename_case});
  const regex = new RegExp(`^${escapeRegExp(slug)}(?:[^\\/\\\\]+)`);
  const self = this;
  let src = '';
  const result = {};

  data.layout = (data.layout || config.default_layout).toLowerCase();

  // Find the draft
  return fs.listDir(draftDir).then(list => {
    return list.find(item => regex.test(item));
  }).then(item => {
    if (!item) throw new Error(`Draft "${slug}" does not exist.`);

    // Read the content
    src = pathFn.join(draftDir, item);
    return fs.readFile(src);
  }).then(content => {
    // Create post
    _.extend(data, yfm(content));
    data.content = data._content;
    delete data._content;

    return self.create(data, replace).then(post => {
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
  const cache = [];
  const { tag } = ctx.extend;
  const ext = data.engine || (source ? pathFn.extname(source) : '');

  const isSwig = ext === 'swig';

  let disableNunjucks = false;

  if (ext && ctx.render.renderer.get(ext)) {

    // disable Nunjucks when the renderer spcify that.

    disableNunjucks = disableNunjucks || !!ctx.render.renderer.get(ext).disableNunjucks;

  }

  function escapeContent(str) {
    return `<!--${placeholder}${cache.push(str) - 1}-->`;
  }

  function tagFilter(content) {
    if (disableNunjucks) return content;
    // Replace cache data with real contents
    content = content.replace(rPlaceholder, (...args) => cache[args[1]]);

    // Render with Nunjucks
    data.content = content;
    return tag.render(data.content, data);
  }

  let promise;

  if (data.content != null) {
    promise = Promise.resolve(data.content);
  } else if (source) {
    // Read content from files
    promise = fs.readFile(source);
  } else {
    return Promise.reject(new Error('No input file or string!')).asCallback(callback);
  }

  return promise.then(content => {
    data.content = content;

    // Run "before_post_render" filters
    return ctx.execFilter('before_post_render', data, {context: ctx}).then(() => {
      data.content = data.content.replace(rEscapeContent, (match, content) => escapeContent(content));
    });
  }).then(() => {
    // Skip rendering if this is a swig file
    if (isSwig) return data.content;

    // Escape all Swig tags
    if (!disableNunjucks) {
      data.content = data.content
        .replace(rSwigFullBlock, escapeContent)
        .replace(rSwigBlock, escapeContent)
        .replace(rSwigComment, '')
        .replace(rSwigVar, escapeContent);
    }

    const options = data.markdown || {};
    if (!config.highlight.enable) options.highlight = null;

    // Render with markdown or other renderer
    return ctx.render.render({
      text: data.content,
      path: source,
      engine: data.engine,
      toString: true,
      onRenderEnd: tagFilter
    }, options);
  }).then(content => {
    data.content = content;

    if (!isSwig) {
      return data.content;
    }

    // Render with Nunjucks
    return tag.render(data.content, data);
  }).then(content => {
    data.content = content;

    // Run "after_post_render" filters
    return ctx.execFilter('after_post_render', data, {context: ctx});
  }).asCallback(callback);
};

module.exports = Post;

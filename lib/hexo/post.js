'use strict';

var moment = require('moment');
var swig = require('swig');
var Promise = require('bluebird');
var pathFn = require('path');
var _ = require('lodash');
var yaml = require('js-yaml');
var util = require('hexo-util');
var fs = require('hexo-fs');
var yfm = require('hexo-front-matter');

var slugize = util.slugize;
var escapeRegExp = util.escapeRegExp;

var rEscapeContent = /<escape(?:[^>]*)>([\s\S]*?)<\/escape>/g;
var rSwigVar = /\{\{[\s\S]*?\}\}/g;
var rSwigComment = /\{#[\s\S]*?#\}/g;
var rSwigBlock = /\{%[\s\S]*?%\}/g;
var rSwigFullBlock = /\{% *(.+?)(?: *| +.*)%\}[\s\S]+?\{% *end\1 *%\}/g;
var placeholder = '\uFFFC';
var rPlaceholder = /(?:<|&lt;)\!--\uFFFC(\d+)--(?:>|&gt;)/g;

var preservedKeys = {
  title: true,
  slug: true,
  path: true,
  layout: true,
  date: true,
  content: true
};

swig.setDefaults({
  autoescape: false
});

function Post(context){
  this.context = context;
}

Post.prototype.create = function(data, replace, callback){
  if (!callback && typeof replace === 'function'){
    callback = replace;
    replace = false;
  }

  var ctx = this.context;
  var config = ctx.config;

  data.slug = slugize(data.slug || data.title, {transform: config.filename_case});
  data.layout = (data.layout || config.default_layout).toLowerCase();
  data.date = data.date ? moment(data.date) : moment();

  return Promise.all([
    // Get the post path
    ctx.execFilter('new_post_path', data, {
      args: [replace],
      context: ctx
    }),
    // Get the scaffold
    this._getScaffold(data.layout)
  ]).spread(function(path, scaffold){
    data.date = data.date.format('YYYY-MM-DD HH:mm:ss');

    // Split data part from the raw scaffold
    var split = yfm.split(scaffold);
    var separator = split.separator || '---';
    var jsonMode = separator[0] === ';';

    var frontMatter;

    if (jsonMode){
      frontMatter = prepareJFM(_.clone(data));
    } else {
      frontMatter = prepareYFM(_.clone(data));
    }

    // Compile front-matter with data
    var content = swig.compile(split.data)(frontMatter) + '\n';

    // Parse front-matter
    var compiled;

    if (jsonMode){
      compiled = JSON.parse('{' + content + '}');
    } else {
      compiled = yaml.load(content);
    }

    // Add data which are not in the front-matter
    var keys = Object.keys(data);
    var key = '';
    var obj = {};

    for (var i = 0, len = keys.length; i < len; i++){
      key = keys[i];

      if (!preservedKeys[key] && !compiled.hasOwnProperty(key)){
        obj[key] = data[key];
      }
    }

    if (Object.keys(obj).length){
      if (jsonMode){
        if (content){
          content = content.trim() + ',\n';
        }

        content += JSON.stringify(obj, null, '  ')
          // Remove indention
          .replace(/\n {2}/g, function(){
            return '\n';
          })
          // Remove prefixing and trailing braces
          .replace(/^{\n|}$/g, '');
      } else {
        content += yaml.dump(obj);
      }
    }

    // Add separators
    if (split.prefixSeparator) content = separator + '\n' + content;
    content += separator + '\n';

    // Concat content
    content += split.content;

    if (data.content){
      content += '\n' + data.content;
    }

    var result = {
      path: path,
      content: content
    };

    return Promise.all([
      // Write content to file
      fs.writeFile(path, content),
      // Create asset folder
      createAssetFolder(path, config.post_asset_folder)
    ]).then(function(){
      ctx.emit('new', result);
    }).thenReturn(result);
  }).nodeify(callback);
};

// Prepare data for JSON front-matter:
// - Add quotations for strings
function prepareJFM(data){
  var keys = Object.keys(data);
  var key = '';
  var item;

  for (var i = 0, len = keys.length; i < len; i++){
    key = keys[i];
    item = data[key];

    if (typeof item === 'string'){
      data[key] = '"' + item + '"';
    }
  }

  return data;
}

function prepareYFM(data){
  data.title = '"' + data.title + '"';

  return data;
}

Post.prototype._getScaffold = function(layout){
  var ctx = this.context;

  return ctx.scaffold.get(layout).then(function(result){
    if (result != null) return result;
    return ctx.scaffold.get('normal');
  });
};

function createAssetFolder(path, assetFolder){
  if (!assetFolder) return Promise.resolve();

  var target = removeExtname(path);

  return fs.exists(target).then(function(exist){
    if (!exist) return fs.mkdirs(target);
  });
}

function removeExtname(str){
  return str.substring(0, str.length - pathFn.extname(str).length);
}

Post.prototype.publish = function(data, replace, callback){
  if (!callback && typeof replace === 'function'){
    callback = replace;
    replace = false;
  }

  if (data.layout === 'draft') data.layout = 'post';

  var ctx = this.context;
  var config = ctx.config;
  var draftDir = pathFn.join(ctx.source_dir, '_drafts');
  var slug = data.slug = slugize(data.slug, {transform: config.filename_case});
  var regex = new RegExp('^' + escapeRegExp(slug) + '(?:[^\\/\\\\]+)');
  var self = this;
  var src = '';
  var result = {};

  data.layout = (data.layout || config.default_layout).toLowerCase();

  // Find the draft
  return fs.listDir(draftDir).then(function(list){
    var item = '';

    for (var i = 0, len = list.length; i < len; i++){
      item = list[i];
      if (regex.test(item)) return item;
    }
  }).then(function(item){
    if (!item) throw new Error('Draft "' + slug + '" does not exist.');

    // Read the content
    src = pathFn.join(draftDir, item);
    return fs.readFile(src);
  }).then(function(content){
    // Create post
    _.extend(data, yfm(content));
    data.content = data._content;
    delete data._content;

    return self.create(data, replace).then(function(post){
      result.path = post.path;
      result.content = post.content;
    });
  }).then(function(){
    // Remove the original draft file
    return fs.unlink(src);
  }).then(function(){
    if (!config.post_asset_folder) return;

    // Copy assets
    var assetSrc = removeExtname(src);
    var assetDest = removeExtname(result.path);

    return fs.exists(assetSrc).then(function(exist){
      if (!exist) return;

      return fs.copyDir(assetSrc, assetDest).then(function(){
        return fs.rmdir(assetSrc);
      });
    });
  }).thenReturn(result).nodeify(callback);
};

Post.prototype.render = function(source, data, callback){
  data = data || {};

  var ctx = this.context;
  var config = ctx.config;
  var cache = [];
  var tag = ctx.extend.tag;
  var isSwig = data.engine === 'swig' || (source && pathFn.extname(source) === '.swig');

  data = data || {};

  function escapeContent(str){
    return '<!--' + placeholder + (cache.push(str) - 1) + '-->';
  }

  return new Promise(function(resolve, reject){
    if (data.content != null) return resolve(data.content);
    if (!source) return reject(new Error('No input file or string!'));

    // Read content from files
    fs.readFile(source).then(resolve, reject);
  }).then(function(content){
    data.content = content;

    // Run "before_post_render" filters
    return ctx.execFilter('before_post_render', data, {context: ctx}).then(function(){
      data.content = data.content.replace(rEscapeContent, function(match, content){
        return escapeContent(content);
      });
    });
  }).then(function(){
    // Skip rendering if this is a swig file
    if (isSwig) return data.content;

    // Escape all Swig tags
    data.content = data.content
      .replace(rSwigFullBlock, escapeContent)
      .replace(rSwigBlock, escapeContent)
      .replace(rSwigComment, '')
      .replace(rSwigVar, escapeContent);

    var options = data.markdown || {};
    if (!config.highlight.enable) options.highlight = null;

    // Render with markdown or other renderer
    return ctx.render.render({
      text: data.content,
      path: source,
      engine: data.engine,
      toString: true
    }, options);
  }).then(function(content){
    // Replace cache data with real contents
    data.content = content.replace(rPlaceholder, function(){
      return cache[arguments[1]];
    });

    // Clean cache
    cache.length = 0;

    // Render with Nunjucks
    return tag.render(data.content, data);
  }).then(function(content){
    data.content = content;

    // Run "after_post_render" filters
    return ctx.execFilter('after_post_render', data, {context: ctx});
  });
};

module.exports = Post;
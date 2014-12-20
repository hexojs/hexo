var moment = require('moment');
var swig = require('swig');
var Promise = require('bluebird');
var pathFn = require('path');
var _ = require('lodash');
var yaml = require('js-yaml');
var util = require('hexo-util');
var fs = require('hexo-fs');
var yfm = require('hexo-front-matter');

var escape = util.escape;

var rEscapeContent = /<escape(?:[^>]*)>([\s\S]+?)<\/escape>/g;
var rUnescape = /<hexoescape>(\d+)<\/hexoescape>/g;

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

  data.slug = escape.filename(data.slug || data.title, config.filename_case);
  data.layout = (data.layout || config.default_layout).toLowerCase();
  data.date = data.date ? moment(data.date) : moment();

  return Promise.all([
    // Get the post path
    ctx.extend.filter.exec('new_post_path', data, {
      args: [replace],
      context: ctx
    }),
    // Get the scaffold
    this._getScaffold(data.layout)
  ]).spread(function(path, scaffold){
    // Wrap title with quotations
    data.title = '"' + data.title + '"';
    data.date = data.date.format('YYYY-MM-DD HH:mm:ss');

    // Split data part from the raw scaffold
    var split = yfm.split(scaffold);

    // Compile front-matter with data
    var content = swig.compile(split.data)(data) + '\n';

    // Parse front-matter
    var compiled = yaml.load(content);

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
      content += yaml.dump(obj);
    }

    content += '---\n';

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

Post.prototype.load = function(options, callback){
  if (!callback && typeof options === 'function'){
    callback = options;
    options = {};
  }

  options = options || {};

  var ctx = this.context;

  function generate(){
    return ctx.theme.generate();
  }

  function watchChanges(watcher){
    watcher
      .on('add', generate)
      .on('change', generate)
      .on('unlink', generate);
  }

  return Promise.all([
    ctx.theme.process(),
    ctx.source.process()
  ]).then(generate).then(function(){
    if (!options.watch) return;

    ctx.theme.watch().then(watchChanges);
    ctx.source.watch().then(watchChanges);
  }).nodeify(callback);
};

Post.prototype.publish = function(data, replace, callback){
  if (!callback && typeof replace === 'function'){
    callback = replace;
    replace = false;
  }

  if (data.layout === 'draft') data.layout = 'post';

  var ctx = this.context;
  var config = ctx.config;
  var draftDir = pathFn.join(ctx.source_dir, '_drafts');
  var slug = data.slug = escape.filename(data.slug, config.filename_case);
  var regex = new RegExp('^' + escape.regex(slug) + '(?:[^\\/\\\\]+)');
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
  if (!callback && typeof data === 'function'){
    callback = data;
    data = source;
    source = null;
  }

  var ctx = this.context;
  var config = ctx.config;
  var swig = ctx.extend.tag.swig;
  var filter = ctx.extend.filter;
  var cache = [];

  // Replaces <escape>content</escape> in raw content with `<hexoescape>cache id</hexoescape>`
  function escapeContent(match, content){
    return '<hexoescape>' + (cache.push(content) - 1) + '</hexoescape>';
  }

  return new Promise(function(resolve, reject){
    if (data.content != null) return resolve(data.content);
    if (!source) return reject(new Error('No input file or string!'));

    // Read content from files
    fs.readFile(source).then(resolve, reject);
  }).then(function(content){
    // Render content with Swig
    data.content = swig.render(content, {
      locals: data,
      filename: source
    }).replace(rEscapeContent, escapeContent);
  }).then(function(){
    // Run "before_post_render" filters
    return filter.exec('before_post_render', data, {context: ctx}).then(function(){
      data.content = data.content.replace(rEscapeContent, escapeContent);
    });
  }).then(function(){
    var options = data.markdown || {};
    if (!config.highlight.enable) options.highlight = null;

    // Renders with Markdown or other render engines.
    return ctx.render.render({
      text: data.content,
      path: source,
      engine: data.engine
    }, options);
  }).then(function(content){
    // Replaces cache data with real contents.
    data.content = content.replace(rUnescape, function(match, number){
      return cache[number];
    });

    // Clean cache
    cache.length = 0;

    // Run "after_post_render" filters
    return filter.exec('after_post_render', data, {context: ctx});
  });
};

module.exports = Post;
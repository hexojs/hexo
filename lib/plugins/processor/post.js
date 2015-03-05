'use strict';

var common = require('./common');
var Promise = require('bluebird');
var yfm = require('hexo-front-matter');
var pathFn = require('path');
var fs = require('hexo-fs');
var util = require('hexo-util');
var slugize = util.slugize;
var Pattern = util.Pattern;
var Permalink = util.Permalink;

var postDir = '_posts/';
var draftDir = '_drafts/';
var permalink;

var preservedKeys = {
  title: true,
  year: true,
  month: true,
  day: true,
  i_month: true,
  i_day: true
};

function startsWith(str, prefix){
  return str.substring(0, prefix.length) === prefix;
}

exports.process = function(file){
  if (this.render.isRenderable(file.path)){
    return processPost.call(this, file);
  } else if (this.config.post_asset_folder){
    return processAsset.call(this, file);
  }
};

exports.pattern = new Pattern(function(path){
  if (common.isTmpFile(path)) return false;

  var result;

  if (startsWith(path, postDir)){
    result = {
      published: true,
      path: path.substring(postDir.length)
    };
  } else if (startsWith(path, draftDir)){
    result = {
      published: false,
      path: path.substring(draftDir.length)
    };
  } else {
    return false;
  }

  if (common.isHiddenFile(result.path)) return false;
  return result;
});

function processPost(file){
  /* jshint validthis: true */
  var Post = this.model('Post');
  var path = file.params.path;
  var doc = Post.findOne({source: file.path});
  var self = this;
  var config = this.config;
  var timezone = config.timezone;
  var categories, tags;

  if (file.type === 'skip' && doc){
    return;
  }

  if (file.type === 'delete'){
    if (doc){
      return doc.remove();
    } else {
      return;
    }
  }

  return Promise.all([
    file.stat(),
    file.read()
  ]).spread(function(stats, content){
    var data = yfm(content);
    var info = parseFilename(config.new_post_name, path);
    var keys = Object.keys(info);
    var key;

    data.source = file.path;
    data.raw = content;
    data.slug = info.title;

    if (file.params.published){
      if (!data.hasOwnProperty('published')) data.published = true;
    } else {
      data.published = false;
    }

    for (var i = 0, len = keys.length; i < len; i++){
      key = keys[i];
      if (!preservedKeys[key]) data[key] = info[key];
    }

    if (data.date){
      data.date = common.toDate(data.date);
    } else if (info && info.year && (info.month || info.i_month) && (info.day || info.i_day)){
      data.date = new Date(
        info.year,
        parseInt(info.month || info.i_month, 10) - 1,
        parseInt(info.day || info.i_day, 10)
      );
    }

    if (data.date){
      if (timezone) data.date = common.timezone(data.date, timezone);
    } else {
      data.date = stats.ctime;
    }

    data.updated = common.toDate(data.updated);

    if (data.updated){
      if (timezone) data.updated = common.timezone(data.updated, timezone);
    } else {
      data.updated = stats.mtime;
    }

    if (data.category && !data.categories){
      data.categories = data.category;
      delete data.category;
    }

    if (data.tag && !data.tags){
      data.tags = data.tag;
      delete data.tag;
    }

    categories = data.categories || [];
    tags = data.tags || [];

    if (!Array.isArray(categories)) categories = [categories];
    if (!Array.isArray(tags)) tags = [tags];

    if (data.photo && !data.photos){
      data.photos = data.photo;
      delete data.photo;
    }

    if (data.photos && !Array.isArray(data.photos)){
      data.photos = [data.photos];
    }

    if (data.link && !data.title){
      data.title = data.link.replace(/^https?:\/\/|\/$/g, '');
    }

    if (doc){
      return doc.replace(data);
    } else {
      return Post.insert(data);
    }
  }).then(function(doc){
    return Promise.all([
      doc.setCategories(categories),
      doc.setTags(tags),
      scanAssetDir.call(self, doc)
    ]);
  });
}

function parseFilename(config, path){
  config = config.substring(0, config.length - pathFn.extname(config).length);
  path = path.substring(0, path.length - pathFn.extname(path).length);

  if (!permalink || permalink.rule !== config){
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

  var data = permalink.parse(path);

  if (data){
    return data;
  } else {
    return {
      title: slugize(path)
    };
  }
}

function scanAssetDir(post){
  /* jshint validthis: true */
  if (!this.config.post_asset_folder) return;

  var assetDir = post.asset_dir;
  var baseDir = this.base_dir;
  var baseDirLength = baseDir.length;
  var PostAsset = this.model('PostAsset');

  return fs.exists(assetDir).then(function(exist){
    return exist ? fs.listDir(assetDir) : [];
  }).filter(function(item){
    return !common.isTmpFile(item) && !common.isHiddenFile(item);
  }).map(function(item){
    var id = pathFn.join(assetDir, item).substring(baseDirLength).replace(/\\/g, '/');
    var asset = PostAsset.findById(id);
    if (asset) return;

    return PostAsset.insert({
      _id: id,
      post: post._id,
      slug: item,
      modified: true
    });
  });
}

function processAsset(file){
  /* jshint validthis: true */
  var PostAsset = this.model('PostAsset');
  var Post = this.model('Post');
  var id = file.source.substring(this.base_dir.length).replace(/\\/g, '/');
  var doc = PostAsset.findById(id);
  var post;

  if (file.type === 'skip' && doc){
    return;
  }

  if (file.type === 'delete'){
    if (doc){
      return doc.remove();
    } else {
      return;
    }
  }

  if (doc){
    post = Post.findById(doc.post);

    if (post){
      doc.modified = file.type !== 'skip';
      return doc.save();
    } else {
      return doc.remove();
    }
  }

  var posts = Post.toArray();

  for (var i = 0, len = posts.length; i < len; i++){
    post = posts[i];

    if (startsWith(file.source, post.asset_dir)){
      return PostAsset.insert({
        _id: id,
        slug: file.source.substring(post.asset_dir.length),
        post: post._id
      });
    }
  }
}
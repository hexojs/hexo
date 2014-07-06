var moment = require('moment'),
  path = require('path'),
  url = require('url'),
  util = require('../util'),
  escape = util.escape;

var Schema = require('warehouse').Schema,
  Moment = require('./types/moment');

var isEndWith = function(str, last){
  return str[str.length - 1] === last;
};

var permalinkGetter = function(){
  var url = hexo.config.url;

  return url + (isEndWith(url, '/') ? '' : '/') + this.path;
};

var Post = exports.Post = new Schema({
  id: Number,
  title: {type: String, default: ''},
  date: {type: Moment, default: moment},
  updated: {type: Moment, default: moment},
  categories: [{type: String, ref: 'Category'}],
  tags: [{type: String, ref: 'Tag'}],
  comments: {type: Boolean, default: true},
  layout: {type: String, default: 'post'},
  content: {type: String, default: ''},
  excerpt: {type: String, default: ''},
  source: {type: String, required: true},
  slug: {type: String, required: true},
  photos: [String],
  link: {type: String, default: ''},
  raw: {type: String, default: ''}
});

Post.virtual('path', function(){
  return hexo.extend.filter.apply('post_permalink', this);
});

Post.virtual('permalink', permalinkGetter);

Post.virtual('full_source', function(){
  return path.join(hexo.source_dir, this.source);
});

Post.virtual('asset_dir', function(){
  var src = this.full_source;

  return src.substring(0, src.length - path.extname(src).length) + path.sep;
});

var Page = exports.Page = new Schema({
  title: {type: String, default: ''},
  date: {type: Moment, default: moment},
  updated: {type: Moment, default: moment},
  comments: {type: Boolean, default: true},
  layout: {type: String, default: 'page'},
  content: {type: String, default: ''},
  excerpt: {type: String, default: ''},
  source: {type: String, required: true},
  path: {type: String, required: true},
  raw: {type: String, default: ''}
});

Page.virtual('permalink', permalinkGetter);

Page.virtual('full_source', function(){
  return path.join(hexo.source_dir, this.source);
});

var Category = exports.Category = new Schema({
  name: {type: String, required: true},
  parent: {type: String, ref: 'Category'},
  posts: [{type: String, ref: 'Post'}]
});

Category.virtual('slug', function(){
  var map = hexo.config.category_map,
    name = this.name,
    str = '';

  if (this.parent){
    var model = hexo.model,
      Category = model('Category'),
      parent = Category.get(this.parent);

    str += parent.slug + '/';
  }

  name = map && map.hasOwnProperty(name) ? map[name] : name;
  str += escape.filename(name, hexo.config.filename_case);

  return str;
});

Category.virtual('path', function(){
  var catDir = hexo.config.category_dir;

  return catDir + (isEndWith(catDir, '/') ? '' : '/') + this.slug + '/';
});

Category.virtual('permalink', permalinkGetter);

Category.virtual('length', function(){
  return this.posts.length;
});

var Tag = exports.Tag = new Schema({
  name: {type: String, required: true},
  posts: [{type: String, ref: 'Post'}]
});

Tag.virtual('slug', function(){
  var map = hexo.config.tag_map,
    name = this.name;

  name = map && map.hasOwnProperty(name) ? map[name] : name;
  return escape.filename(name, hexo.config.filename_case);
});

Tag.virtual('path', function(){
  var tagDir = hexo.config.tag_dir;

  return tagDir + (isEndWith(tagDir, '/') ? '' : '/') + this.slug + '/';
});

Tag.virtual('permalink', permalinkGetter);

Tag.virtual('length', function(){
  return this.posts.length;
});

var Cache = exports.Cache = new Schema({
  _id: {type: String},
  mtime: {type: Number, default: Date.now}
});

var Asset = exports.Asset = new Schema({
  _id: {type: String},
  path: {type: String},
  modified: {type: Boolean, default: true},
  post_id: {type: String, ref: 'Post'},
  post_path: {type: String}
});
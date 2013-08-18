var moment = require('moment'),
  path = require('path');

var Schema = require('warehouse').Schema,
  Moment = require('./types/moment'),
  Serial = require('./types/serial');

var isEndWith = function(str, last){
  return str[str.length - 1] === last;
};

var permalinkGetter = function(){
  var url = hexo.config.url;

  return url + (isEndWith(url, '/') ? '' : '/') + this.path;
};

var Post = exports.Post = new Schema({
  // _id: {type: Serial, required: true},
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
  raw: {type: String, default: ''}
});

Post.virtual('path', function(){
  var date = this.date,
    categories = this.categories,
    config = hexo.config,
    permalink = config.permalink;

  var url = permalink
    .replace(':id', this.id || this._id)
    .replace(':year', date.format('YYYY'))
    .replace(':month', date.format('MM'))
    .replace(':day', date.format('DD'))
    .replace(':title', this.slug);

  if (categories.length){
    var category = categories[categories.length - 1],
      Category = hexo.model('Category'),
      slug = Category.get(category).slug;

    url = url.replace(':category', slug);
  } else {
    url = url.replace(':category', config.default_category);
  }

  return url;
});

Post.virtual('permalink', permalinkGetter);

Post.virtual('full_source', function(){
  return path.join(hexo.source_dir, this.source);
});

var Page = exports.Page = new Schema({
  // _id: {type: Serial, required: true},
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
  // _id: {type: Serial, required: true},
  name: {type: String, required: true},
  parent: {type: String, ref: 'Category'},
  posts: [{type: String, ref: 'Post'}]
});

Category.virtual('slug', function(){
  var map = hexo.config.category_map,
    str = '';

  if (this.parent){
    var model = hexo.model,
      Category = model('Category'),
      parent = Category.get(this.parent);

    str += parent.slug;
  }

  str += map && map.hasOwnProperty(name) ? map[name] : name;

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
  // _id: {type: Serial, required: true},
  name: {type: String, required: true},
  posts: [{type: String, ref: 'Post'}]
});

Tag.virtual('slug', function(){
  var map = hexo.config.tag_map,
    name = this.name;

  return map && map.hasOwnProperty(name) ? map[name] : name;
});

Tag.virtual('path', function(){
  var tagDir = hexo.config.tag_dir;

  return tagDir + (isEndWith(tagDir, '/') ? '' : '/') + this.slug + '/';
});

Tag.virtual('permalink', permalinkGetter);

Tag.virtual('length', function(){
  return this.posts.length;
});

var Asset = exports.Asset = new Schema({
  source: {type: String, required: true},
  mtime: {type: Number, default: Date.now}
});

var Cache = exports.Cache = new Schema({
  source: {type: String, required: true},
  content: {type: String, default: ''},
  mtime: {type: Number, default: Date.now}
});
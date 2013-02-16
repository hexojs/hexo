var moment = require('moment'),
  db = hexo.db,
  Schema = db.Schema,
  config = hexo.config,
  siteUrl = config.url + '/';

var schemaPosts = new Schema({
  title: String,
  date: Date,
  updated: Date,
  categories: [Number],
  tags: [Number],
  comments: Boolean,
  layout: {type: String, default: 'post'},
  content: String,
  excerpt: String,
  source: String,
  path: String
});

var schemaPages = new Schema({
  title: String,
  date: Date,
  updated: Date,
  comments: Boolean,
  layout: {type: String, default: 'page'},
  content: String,
  source: String,
  path: String
});

var schemaCats = new Schema({
  name: String,
  path: String,
  posts: [Number]
});

var schemaTags = new Schema({
  name: String,
  path: String,
  posts: [Number]
});

var schemaAssets = new Schema({
  path: String,
  mtime: Date
});

var dateGetter = function(){
  return moment(this.date);
};

var updatedGetter = function(){
  return moment(this.updated);
};

var permalinkGetter = function(){
  return siteUrl + this.path;
};

var catPostGetter = function(){
  return dbPosts._init(this.posts);
};

var tagPostGetter = function(){
  return dbPosts._init(this.posts);
};

schemaPosts.virtual('date').get(dateGetter);
schemaPosts.virtual('updated').get(updatedGetter);
schemaPosts.virtual('permalink').get(permalinkGetter);

schemaPages.virtual('date').get(dateGetter);
schemaPages.virtual('updated').get(updatedGetter);
schemaPages.virtual('permalink').get(permalinkGetter);

schemaCats.virtual('permalink').get(permalinkGetter);
schemaCats.virtual('posts').get(catPostGetter);

schemaTags.virtual('permalink').get(permalinkGetter);
schemaTags.virtual('posts').get(tagPostGetter);

var dbPosts = exports.posts = db.model('posts', schemaPosts),
  dbPages = exports.pages = db.model('pages', schemaPages),
  dbCats = exports.categories = db.model('categories', schemaCats),
  dbTags = exports.tags = db.model('tags', schemaTags),
  dbAssets = exports.assets = db.model('assets', schemaAssets);
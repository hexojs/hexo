var moment = require('moment'),
  db = hexo.db,
  Schema = db.Schema,
  config = hexo.config,
  siteUrl = config.url + '/',
  sourceDir = hexo.source_dir;

var schemaPosts = new Schema({
  title: String,
  date: Date,
  updated: Date,
  categories: [Number],
  tags: [Number],
  comments: Boolean,
  layout: {type: String, default: 'post'},
  content: String,
  excerpt: Number,
  source: String,
  path: String,
  ctime: Date,
  mtime: Date
});

var schemaPages = new Schema({
  title: String,
  date: Date,
  updated: Date,
  comments: Boolean,
  layout: {type: String, default: 'page'},
  content: String,
  excerpt: String,
  source: String,
  path: String,
  ctime: Date,
  mtime: Date
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
  source: String,
  mtime: Date
});

var dateGetter = function(){
  return moment(this.date);
};

var updatedGetter = function(){
  return moment(this.updated);
};

var ctimeGetter = function(){
  return moment(this.ctime);
};

var mtimeGetter = function(){
  return moment(this.mtime);
};

var catGetter = function(){
  return dbCats._init(this.categories);
};

var tagGetter = function(){
  return dbTags._init(this.tags);
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

var excerptGetter = function(){
  return this.content.substring(0, this.excerpt);
}

schemaPosts.virtual('date').get(dateGetter);
schemaPosts.virtual('updated').get(updatedGetter);
schemaPosts.virtual('permalink').get(permalinkGetter);
schemaPosts.virtual('categories').get(catGetter);
schemaPosts.virtual('tags').get(tagGetter);
schemaPosts.virtual('ctime').get(ctimeGetter);
schemaPosts.virtual('mtime').get(mtimeGetter);
schemaPosts.virtual('excerpt').get(excerptGetter);

schemaPages.virtual('date').get(dateGetter);
schemaPages.virtual('updated').get(updatedGetter);
schemaPages.virtual('permalink').get(permalinkGetter);
schemaPages.virtual('ctime').get(ctimeGetter);
schemaPages.virtual('mtime').get(mtimeGetter);

schemaCats.virtual('permalink').get(permalinkGetter);
schemaCats.virtual('posts').get(catPostGetter);

schemaTags.virtual('permalink').get(permalinkGetter);
schemaTags.virtual('posts').get(tagPostGetter);

var dbPosts = exports.posts = db.model('posts', schemaPosts),
  dbPages = exports.pages = db.model('pages', schemaPages),
  dbCats = exports.categories = db.model('categories', schemaCats),
  dbTags = exports.tags = db.model('tags', schemaTags),
  dbAssets = exports.assets = db.model('assets', schemaAssets);

dbCats.on('update', function(data, id){
  if (!data.posts.length){
    this.remove(id);
  }
});

dbTags.on('update', function(data, id){
  if (!data.posts.length){
    this.remove(id);
  }
});
var moment = require('moment'),
  db = hexo.db,
  Schema = db.Schema,
  config = hexo.config,
  siteUrl = config.url + '/',
  sourceDir = hexo.source_dir,
  catDir = (config.category_dir || 'categories') + '/',
  tagDir = (config.tag_dir || 'tags') + '/',
  defaultCategory = config.default_category || 'uncategorized',
  configLink = config.permalink || ':year/:month/:day/:title/';

var schemaPosts = new Schema({
  postID: Number,
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
  slug: String,
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
  excerpt: Number,
  source: String,
  path: String,
  ctime: Date,
  mtime: Date
});

var schemaCats = new Schema({
  name: String,
  slug: String,
  posts: [Number]
});

var schemaTags = new Schema({
  name: String,
  slug: String,
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

var permalinkGetter = function(){
  return siteUrl + this.path;
};

var postsGetter = function(){
  return dbPosts._init(this.posts);
};

var excerptGetter = function(){
  return this.content.substring(0, this.excerpt);
};

var postCountGetter = function(){
  return this.posts.length;
};

var fullPathGetter = function(){
  return sourceDir + this.source;
};

schemaPosts.virtual('categories').get(function(){
  return dbCats._init(this.categories);
});
schemaPosts.virtual('tags').get(function(){
  return dbTags._init(this.tags);
});
schemaPosts.virtual('date').get(dateGetter);
schemaPosts.virtual('path').get(function(){
  var date = this.date,
    cat = this.categories.last();
  return configLink
    .replace(':postID', this.postID || 0)
    .replace(':category', cat ? cat.slug : defaultCategory)
    .replace(':year', date.format('YYYY'))
    .replace(':month', date.format('MM'))
    .replace(':day', date.format('DD'))
    .replace(':title', this.slug);
});
schemaPosts.virtual('updated').get(updatedGetter);
schemaPosts.virtual('permalink').get(permalinkGetter);
schemaPosts.virtual('ctime').get(ctimeGetter);
schemaPosts.virtual('mtime').get(mtimeGetter);
schemaPosts.virtual('excerpt').get(excerptGetter);
schemaPosts.virtual('full_path').get(fullPathGetter);

schemaPages.virtual('date').get(dateGetter);
schemaPages.virtual('updated').get(updatedGetter);
schemaPages.virtual('permalink').get(permalinkGetter);
schemaPages.virtual('ctime').get(ctimeGetter);
schemaPages.virtual('mtime').get(mtimeGetter);
schemaPages.virtual('excerpt').get(excerptGetter);
schemaPages.virtual('full_path').get(fullPathGetter);

schemaCats.virtual('path').get(function(){
  return catDir + this.slug + '/';
});
schemaCats.virtual('permalink').get(permalinkGetter);
schemaCats.virtual('length').get(postCountGetter);
schemaCats.virtual('posts').get(postsGetter);

schemaTags.virtual('path').get(function(){
  return tagDir + this.slug + '/';
});
schemaTags.virtual('permalink').get(permalinkGetter);
schemaTags.virtual('length').get(postCountGetter);
schemaTags.virtual('posts').get(postsGetter);

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
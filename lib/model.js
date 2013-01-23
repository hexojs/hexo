var moment = require('moment'),
  Query = require('./db/query'),
  db = hexo.db,
  Schema = db.Schema,
  config = hexo.config,
  siteUrl = config.url + '/';

var schemaPosts = new Schema({
  title: String,
  date: Date,
  updated: Date,
  categories: [new Schema.Types.Reference('categories')],
  tags: [new Schema.Types.Reference('tags')],
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
  posts: [new Schema.Types.Reference('posts')]
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

var permalinkGetter = function(){
  return siteUrl + this.path;
};

var postGetter = function(){
  return new Query(this.posts, this);
};

schemaPosts.virtual('date').get(dateGetter);
schemaPosts.virtual('updated').get(updatedGetter);
schemaPosts.virtual('permalink').get(permalinkGetter);
schemaPages.virtual('date').get(dateGetter);
schemaPages.virtual('updated').get(updatedGetter);
schemaPages.virtual('permalink').get(permalinkGetter);
schemaCats.virtual('permalink').get(permalinkGetter);
schemaCats.virtual('posts').get(postGetter);

exports.posts = db.collection('posts', schemaPosts),
exports.pages = db.collection('pages', schemaPages),
exports.categories = db.collection('categories', schemaCats),
exports.tags = db.collection('tags', schemaCats);
exports.assets = db.collection('assets', schemaAssets);
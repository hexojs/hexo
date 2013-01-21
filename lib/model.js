var db = hexo.db,
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

var schemaTags = new Schema({
  name: String,
  posts: [new Schema.Types.Reference('tags')]
});

var permalinkGetter = function(){
  return siteUrl + this.path;
};

schemaPosts.virtual('permalink').get(permalinkGetter);
schemaPages.virtual('permalink').get(permalinkGetter);
schemaCats.virtual('permalink').get(permalinkGetter);
schemaTags.virtual('path').get(function(){
  return tagDir + escape(this.name);
});

exports.posts = db.collection('posts', schemaPosts),
exports.pages = db.collection('pages', schemaPages),
exports.categories = db.collection('categories', schemaCats),
exports.tags = db.collection('tags', schemaTags);
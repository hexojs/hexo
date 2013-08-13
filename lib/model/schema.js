var Schema = require('warehouse').Schema;

var Post = exports.Post = new Schema({
  id: Number,
  title: {type: String, default: ''},
  date: {type: Date, default: Date.now},
  updated: {type: Date, default: Date.now},
  categories: [{type: String, ref: 'Category'}],
  tags: [{type: String, ref: 'Tag'}],
  comments: {type: Boolean, default: true},
  layout: {type: String, default: 'post'},
  content: {type: String, default: ''},
  excerpt: {type: String, default: ''},
  source: {type: String, required: true},
  path: {type: String, required: true},
  slug: {type: String, required: true},
  ctime: {type: Date, default: Date.now},
  mtime: {type: Date, default: Date.now},
  raw: {type: String, default: ''}
});

var Page = exports.Page = new Schema({
  title: {type: String, default: ''},
  date: {type: Date, default: Date.now},
  updated: {type: Date, default: Date.now},
  comments: {type: Boolean, default: true},
  layout: {type: String, default: 'page'},
  content: {type: String, default: ''},
  excerpt: {type: String, default: ''},
  source: {type: String, required: true},
  path: {type: String, required: true},
  slug: {type: String, required: true},
  ctime: {type: Date, default: Date.now},
  mtime: {type: Date, default: Date.now},
  raw: {type: String, default: ''}
});

var Category = exports.Category = new Schema({
  name: {type: String, default: ''},
  slug: {type: String, required: true},
  posts: [{type: String, ref: 'Post'}]
});

var Tag = exports.Tag = new Schema({
  name: {type: String, default: ''},
  slug: {type: String, required: true},
  posts: [{type: String, ref: 'Post'}]
});

var Asset = exports.Asset = new Schema({
  source: {type: String, required: true},
  mtime: {type: Date, default: Date.now}
});

var Cache = exports.Cache = new Schema({
  source: {type: String, required: true},
  content: {type: String, default: ''},
  mtime: {type: Date, default: Date.now}
});
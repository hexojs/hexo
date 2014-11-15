var Schema = require('warehouse').Schema;
var moment = require('moment');
var pathFn = require('path');
var Promise = require('bluebird');
var Moment = require('./types/moment');

var Post = module.exports = new Schema({
  id: Number,
  title: {type: String, default: ''},
  date: {type: Moment, default: moment},
  updated: {type: Moment, default: moment},
  categories: [{type: Schema.Types.CUID, ref: 'Category'}],
  tags: [{type: Schema.Types.CUID, ref: 'tags'}],
  comments: {type: Boolean, default: true},
  layout: {type: String, default: 'post'},
  content: {type: String, default: ''},
  excerpt: {type: String, default: ''},
  more: {type: String, default: ''},
  source: {type: String, required: true},
  slug: {type: String, required: true},
  photos: [String],
  link: {type: String, default: ''},
  raw: {type: String, default: ''}
});

Post.virtual('path').get(function(){
  return hexo.extend.filter.apply('post_permalink', this);
});

Post.virtual('permalink').get(function(){
  return hexo.config.url + '/' + this.path;
});

Post.virtual('full_source').get(function(){
  return pathFn.join(hexo.source_dir, this.source);
});

Post.virtual('asset_dir').get(function(){
  var src = this.full_source;
  return src.substring(0, src.length - pathFn.extname(src).length) + pathFn.sep;
});
var Schema = require('warehouse').Schema;
var moment = require('moment');
var pathFn = require('path');
var Promise = require('bluebird');
var Moment = require('./types/moment');

module.exports = function(ctx){
  var Post = new Schema({
    id: Number,
    title: {type: String, default: ''},
    date: {type: Moment, default: moment},
    updated: {type: Moment, default: moment},
    comments: {type: Boolean, default: true},
    layout: {type: String, default: 'post'},
    content: {type: String, default: ''},
    excerpt: {type: String, default: ''},
    more: {type: String, default: ''},
    source: {type: String, required: true},
    slug: {type: String, required: true},
    photos: [String],
    link: {type: String, default: ''},
    raw: {type: String, default: ''},
    published: {type: Boolean, default: true}
  });

  Post.virtual('path').get(function(){
    var path = ctx.extend.filter.execSync('post_permalink', this, {context: ctx});
    return typeof path === 'string' ? path : '';
  });

  Post.virtual('permalink').get(function(){
    return ctx.config.url + '/' + this.path;
  });

  Post.virtual('full_source').get(function(){
    return pathFn.join(ctx.source_dir, this.source || '');
  });

  Post.virtual('asset_dir').get(function(){
    var src = this.full_source;
    return src.substring(0, src.length - pathFn.extname(src).length) + pathFn.sep;
  });

  Post.virtual('tags').get(function(){
    var PostTag = ctx.model('PostTag');
    var Tag = ctx.model('Tag');

    var ids = PostTag.find({post_id: this._id}).map(function(item){
      return item.tag_id;
    });

    return Tag.find({_id: {$in: ids}});
  });

  Post.method('setTags', function(tags){
    var PostTag = ctx.model('PostTag');
    var Tag = ctx.model('Tag');
    var id = this._id;

    return Promise.map(tags, function(tag){
      // Find the tag by name
      var data = Tag.findOne({name: tag});
      if (data) return data;

      // Insert the tag if not exist
      return Tag.insert({name: tag});
    }).map(function(tag){
      // Find the reference
      var ref = PostTag.findOne({post_id: id, tag_id: tag._id});
      if (ref) return ref;

      // Insert the reference if not exist
      return PostTag.insert({
        post_id: id,
        tag_id: tag._id
      });
    });
  });

  Post.virtual('categories').get(function(){
    var PostCategory = ctx.model('PostCategory');
    var Category = ctx.model('Category');

    var ids = PostCategory.find({post_id: this._id}).map(function(item){
      return item.category_id;
    });

    return Category.find({_id: {$in: ids}});
  });

  Post.method('setCategories', function(cats){
    var PostCategory = ctx.model('PostCategory');
    var Category = ctx.model('Category');
    var id = this._id;
    var arr = [];

    // Don't use "Promise.map". It doesn't run in series.
    // MUST USE "Promise.each".
    return Promise.each(cats, function(cat, i){
      // Find the category by name
      var data = Category.findOne({
        name: cat,
        parent: i ? cats[i - 1] : {$exists: false}
      });

      if (data){
        arr.push(data._id);
        return data;
      }

      // Insert the category if not exist
      var obj = {name: cat};
      if (i) obj.parent = arr[i - 1];

      return Category.insert(obj).then(function(data){
        arr.push(data._id);
        return data;
      });
    }).each(function(){
      // Get the index from the second argument
      // and get the category id from arr.
      var cat = arr[arguments[1]];

      // Find the reference
      var ref = PostCategory.findOne({post_id: id, tag_id: cat});
      if (ref) return ref;

      // Insert the reference if not exist
      return PostCategory.insert({
        post_id: id,
        category_id: cat
      });
    });
  });

  // Remove PostTag references
  Post.pre('remove', function(data){
    var PostTag = ctx.model('PostTag');
    return PostTag.remove({post_id: data._id});
  });

  // Remove PostCategory references
  Post.pre('remove', function(data){
    var PostCategory = ctx.model('PostCategory');
    return PostCategory.remove({post_id: data._id});
  });

  // Remove assets
  Post.pre('remove', function(data){
    var PostAsset = ctx.model('PostAsset');
    return PostAsset.remove({post: data._id});
  });

  return Post;
};
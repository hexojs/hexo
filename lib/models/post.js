'use strict';

var Schema = require('warehouse').Schema;
var moment = require('moment');
var pathFn = require('path');
var Promise = require('bluebird');
var _ = require('lodash');
var Moment = require('./types/moment');

function pickID(data) {
  return data._id;
}

function removeEmptyTag(tags) {
  return tags.filter(function(tag) {
    return tag != null && tag !== '';
  }).map(function(tag) {
    return tag + '';
  });
}

module.exports = function(ctx) {
  var Post = new Schema({
    id: String,
    title: {type: String, default: ''},
    date: {
      type: Moment,
      default: moment,
      language: ctx.config.languages,
      timezone: ctx.config.timezone
    },
    updated: {
      type: Moment,
      default: moment,
      language: ctx.config.languages,
      timezone: ctx.config.timezone
    },
    comments: {type: Boolean, default: true},
    layout: {type: String, default: 'post'},
    _content: {type: String, default: ''},
    source: {type: String, required: true},
    slug: {type: String, required: true},
    photos: [String],
    link: {type: String, default: ''},
    raw: {type: String, default: ''},
    published: {type: Boolean, default: true},
    content: {type: String},
    excerpt: {type: String},
    more: {type: String}
  });

  Post.virtual('path').get(function() {
    var path = ctx.execFilterSync('post_permalink', this, {context: ctx});
    return typeof path === 'string' ? path : '';
  });

  Post.virtual('permalink').get(function() {
    var url_for = ctx.extend.helper.get('url_for');
    var config = ctx.config;
    var partial_url = url_for.call(ctx, this.path);
    return config.url + _.replace(partial_url, config.root, '/');
  });

  Post.virtual('full_source').get(function() {
    return pathFn.join(ctx.source_dir, this.source || '');
  });

  Post.virtual('asset_dir').get(function() {
    var src = this.full_source;
    return src.substring(0, src.length - pathFn.extname(src).length) + pathFn.sep;
  });

  Post.virtual('tags').get(function() {
    var PostTag = ctx.model('PostTag');
    var Tag = ctx.model('Tag');

    var ids = PostTag.find({post_id: this._id}, {lean: true}).map(function(item) {
      return item.tag_id;
    });

    return Tag.find({_id: {$in: ids}});
  });

  Post.method('setTags', function(tags) {
    tags = removeEmptyTag(tags);

    var PostTag = ctx.model('PostTag');
    var Tag = ctx.model('Tag');
    var id = this._id;
    var existed = PostTag.find({post_id: id}, {lean: true}).map(pickID);

    return Promise.map(tags, function(tag) {
      // Find the tag by name
      var data = Tag.findOne({name: tag}, {lean: true});
      if (data) return data;

      // Insert the tag if not exist
      return Tag.insert({name: tag}).catch(function(err) {
        // Try to find the tag again. Throw the error if not found
        var data = Tag.findOne({name: tag}, {lean: true});

        if (data) return data;
        throw err;
      });
    }).map(function(tag) {
      // Find the reference
      var ref = PostTag.findOne({post_id: id, tag_id: tag._id}, {lean: true});
      if (ref) return ref;

      // Insert the reference if not exist
      return PostTag.insert({
        post_id: id,
        tag_id: tag._id
      });
    }).then(function(tags) {
      // Remove old tags
      var deleted = _.difference(existed, tags.map(pickID));
      return deleted;
    }).map(function(tag) {
      return PostTag.removeById(tag);
    });
  });

  Post.virtual('categories').get(function() {
    var PostCategory = ctx.model('PostCategory');
    var Category = ctx.model('Category');

    var ids = PostCategory.find({post_id: this._id}, {lean: true}).map(function(item) {
      return item.category_id;
    });

    return Category.find({_id: {$in: ids}});
  });

  Post.method('setCategories', function(cats) {
    cats = removeEmptyTag(cats);

    var PostCategory = ctx.model('PostCategory');
    var Category = ctx.model('Category');
    var id = this._id;
    var arr = [];
    var existed = PostCategory.find({post_id: id}, {lean: true}).map(pickID);

    // Don't use "Promise.map". It doesn't run in series.
    // MUST USE "Promise.each".
    return Promise.each(cats, function(cat, i) {
      // Find the category by name
      var data = Category.findOne({
        name: cat,
        parent: i ? arr[i - 1] : {$exists: false}
      }, {lean: true});

      if (data) {
        arr.push(data._id);
        return data;
      }

      // Insert the category if not exist
      var obj = {name: cat};
      if (i) obj.parent = arr[i - 1];

      return Category.insert(obj).catch(function(err) {
        // Try to find the category again. Throw the error if not found
        var data = Category.findOne({
          name: cat,
          parent: i ? arr[i - 1] : {$exists: false}
        }, {lean: true});

        if (data) return data;
        throw err;
      }).then(function(data) {
        arr.push(data._id);
        return data;
      });
    }).map(function() {
      // Get the index from the second argument
      // and get the category id from arr.
      var cat = arr[arguments[1]];

      // Find the reference
      var ref = PostCategory.findOne({post_id: id, category_id: cat}, {lean: true});
      if (ref) return ref;

      // Insert the reference if not exist
      return PostCategory.insert({
        post_id: id,
        category_id: cat
      });
    }).then(function(cats) {
      // Remove old categories
      var deleted = _.difference(existed, cats.map(pickID));
      return deleted;
    }).map(function(cat) {
      return PostCategory.removeById(cat);
    });
  });

  // Remove PostTag references
  Post.pre('remove', function(data) {
    var PostTag = ctx.model('PostTag');
    return PostTag.remove({post_id: data._id});
  });

  // Remove PostCategory references
  Post.pre('remove', function(data) {
    var PostCategory = ctx.model('PostCategory');
    return PostCategory.remove({post_id: data._id});
  });

  // Remove assets
  Post.pre('remove', function(data) {
    var PostAsset = ctx.model('PostAsset');
    return PostAsset.remove({post: data._id});
  });

  return Post;
};

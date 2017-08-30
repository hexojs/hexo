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
    var self = _.assign({}, ctx.extend.helper.list(), ctx);
    var config = ctx.config;
    var partial_url = self.url_for(this.path);
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
    // Remove empty categories, preserving hierarchies
    cats = cats.filter(function(cat) {
      return Array.isArray(cat) ? true : cat != null && cat !== '';
    }).map(function(cat) {
      return Array.isArray(cat) ? removeEmptyTag(cat) : cat + '';
    });

    var PostCategory = ctx.model('PostCategory');
    var Category = ctx.model('Category');
    var id = this._id;
    var allIds = [];
    var existed = PostCategory.find({post_id: id}, {lean: true}).map(pickID);
    var hasHierarchy = cats.filter(Array.isArray).length > 0;

    // Add a hierarchy of categories
    var addHierarchy = function(catHierarchy) {
      var parentIds = [];
      if (!Array.isArray(catHierarchy)) catHierarchy = [catHierarchy];
      // Don't use "Promise.map". It doesn't run in series.
      // MUST USE "Promise.each".
      return Promise.each(catHierarchy, function(cat, i) {
        // Find the category by name
        var data = Category.findOne({
          name: cat,
          parent: i ? parentIds[i - 1] : {$exists: false}
        }, {lean: true});

        if (data) {
          allIds.push(data._id);
          parentIds.push(data._id);
          return data;
        }

        // Insert the category if not exist
        var obj = {name: cat};
        if (i) obj.parent = parentIds[i - 1];

        return Category.insert(obj).catch(function(err) {
          // Try to find the category again. Throw the error if not found
          var data = Category.findOne({
            name: cat,
            parent: i ? parentIds[i - 1] : {$exists: false}
          }, {lean: true});

          if (data) return data;
          throw err;
        }).then(function(data) {
          allIds.push(data._id);
          parentIds.push(data._id);
          return data;
        });
      });
    };

    return (hasHierarchy ? Promise.each(cats, addHierarchy) : Promise.resolve(addHierarchy(cats))
    ).then(function() {
      return allIds;
    }).map(function(catId) {
      // Find the reference
      var ref = PostCategory.findOne({post_id: id, category_id: catId}, {lean: true});
      if (ref) return ref;

      // Insert the reference if not exist
      return PostCategory.insert({
        post_id: id,
        category_id: catId
      });
    }).then(function(postCats) {
      // Remove old categories
      return _.difference(existed, postCats.map(pickID));
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

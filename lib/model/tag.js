/**
 * Module dependencies.
 */

var _ = require('lodash'),
  util = require('../util'),
  escape = util.escape.path,
  model = hexo.model,
  config = hexo.config;

/**
 * Register `Tag` model.
 */

model.extend('Tag', {

  /**
   * Create a new tag.
   *
   * @param {String} name
   * @param {Function} callback
   * @api public
   */

  create: function(name, callback){
    var data = this.findOne({name: name});

    if (data){
      callback && callback(data);
    } else {
      var slug = escape(config.tag_map && config.tag_map[name] ? config.tag_map[name] : name, config.filename_case),
        related = this.find({slug: new RegExp('^' + slug)});

      if (related.length){
        var match = related.last().slug.match(/-(\d+)$/);

        if (match){
          slug += '-' + (parseInt(match[1], 10) + 1);
        } else {
          slug += '-1';
        }
      }

      this.insert({name: name, slug: slug}, callback);
    }
  },

  /**
   * Add the post to the tag.
   *
   * @param {Number} id
   * @param {Number} post
   * @api public
   */

  push: function(id, post){
    this.update(id, {posts: {$addToSet: post}});
  },

  /**
   * Remove the post from the tag.
   *
   * @param {Number} id
   * @param {Number} post
   * @api public
   */

  pull: function(id, post){
    var self = this;

    this.update(id, {posts: {$pull: post}}, function(data){
      if (!data.posts.length) self.remove(id);
    });
  }
});

/**
 * Model alias
 */

model.tags = model('Tag');
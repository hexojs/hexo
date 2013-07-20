/**
 * Module dependencies.
 */

var _ = require('lodash'),
  util = require('../util'),
  escape = util.escape.path,
  config = hexo.config,
  model = hexo.model;

/**
 * Register `Category` model.
 */

model.extend('Category', {

  /**
   * Create a new category.
   *
   * @param {Array|String} cats
   * @param {Function} callback
   * @api public
   */

  create: function(cats, callback){
    if (!Array.isArray(cats)) cats = cats.split('/');

    var self = this,
      arr = [];

    _.each(cats, function(name, i){
      var slug = _.map(cats.slice(0, i + 1), function(name){
        return escape(config.category_map && config.category_map[name] ? config.category_map[name] : name, config.filename_case);
      }).join('/');

      var data = self.findOne({slug: slug});

      if (data){
        arr.push(data);
      } else {
        var related = self.find({slug: new RegExp('^' + slug)});

        if (related.length){
          var match = related.last().slug.match(/-(\d+)$/);

          if (match){
            slug += '-' + (parseInt(match[1], 10) + 1);
          } else {
            slug += '-1';
          }
        }

        self.insert({name: name, slug: slug}, function(cat){
          arr.push(cat);
        })
      }
    });

    callback && callback(arr);
  },

  /**
   * Add the post to the category.
   *
   * @param {Number} id
   * @param {Number} post
   * @api public
   */

  push: function(id, post){
    this.update(id, {posts: {$addToSet: post}});
  },

  /**
   * Remove the post from the category.
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

model.categories = model('Category');
var _ = require('lodash'),
  util = require('../util'),
  escape = util.escape.path,
  model = hexo.model,
  config = hexo.config;

model.extend('Tag', {
  create: function(name, callback){
    var data = this.findOne({name: name});

    if (data){
      callback && callback(data);
    } else {
      var slug = escape(config.tag_map[name] || name, config.filename_case),
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

    return this;
  },
  push: function(id, post){
    this.update(id, {posts: {$addToSet: post}});

    return this;
  },
  pull: function(id, post){
    var self = this;

    this.update(id, {posts: {$pull: post}}, function(data){
      if (!data.posts.length) self.remove(id);
    });

    return this;
  }
});

model.tags = model('Tag');
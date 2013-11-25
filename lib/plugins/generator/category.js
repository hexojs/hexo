var _ = require('lodash'),
  paginator = require('./paginator');

module.exports = function(locals, render, callback){
  var config = hexo.config;

  if (config.exclude_generator && config.exclude_generator.indexOf('category') > -1) return callback();

  var mode = config.category;

  if (!mode){
    if (mode == 0 || mode === false){
      return callback();
    } else {
      mode = 2;
    }
  }

  locals.categories.populate('posts').each(function(cat){
    if (!cat.length) return;

    var posts = cat.posts.sort('date', -1).populate('categories').populate('tags'),
      path = cat.path;

    if (config == 2){
      paginator(path, posts, 'category', render, {category: cat.name});
    } else {
      render(path, ['category', 'archive', 'index'], _.extend({posts: posts}, {category: cat.name}));
    }
  });

  callback();
};
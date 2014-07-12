var _ = require('lodash'),
  paginator = require('./paginator');

module.exports = function(locals, render, callback){
  var config = hexo.config,
    mode = +config.category;

  if (!mode) return callback();

  locals.categories.populate('posts').each(function(cat){
    if (!cat.length) return;

    var posts = cat.posts.sort('date', -1).populate('categories').populate('tags'),
      path = cat.path;

    if (mode === 2){
      paginator(path, posts, 'category', render, {category: cat.name});
    } else {
      render(path, ['category', 'archive', 'index'], _.extend({posts: posts}, {category: cat.name}));
    }
  });

  callback();
};

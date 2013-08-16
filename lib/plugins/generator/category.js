var paginator = require('./paginator');

var config = hexo.config;

module.exports = function(locals, render, callback){
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

    var posts = cat.posts.sort('date', -1),
      path = cat.path;

    if (config == 2){
      paginator(path, posts, 'category', render, {category: cat.name});
    } else {
      posts.category = cat.name;
      render(path, ['category', 'archive', 'index'], posts);
    }
  });

  callback();
};
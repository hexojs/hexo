var paginator = require('./paginator');

module.exports = function(locals, render){
  var config = this.config;
  var mode = +config.category;
  var self = this;

  if (!mode) return;

  locals.categories.forEach(function(cat){
    if (!cat.length) return;

    var posts = cat.posts.sort('-date');
    var path = cat.path;

    if (mode === 2){
      paginator.call(self, path, posts, 'category', render, {category: cat.name});
    } else {
      var data = {
        posts: posts,
        category: cat.name
      };

      render(path, ['category', 'archive', 'index'], data);
    }
  });
};
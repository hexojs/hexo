var paginator = require('./paginator');

module.exports = function(locals, render){
  var config = this.config;
  var mode = +config.tag;
  var self = this;

  if (!mode) return;

  locals.tags.forEach(function(tag){
    if (!tag.length) return;

    var posts = tag.posts.sort('-date');
    var path = tag.path;

    if (mode === 2){
      paginator.call(self, path, posts, 'tag', render, {tag: tag.name});
    } else {
      var data = {
        posts: posts,
        tag: tag.name
      };

      render(path, ['tag', 'archive', 'index'], data);
    }
  });
};
var paginator = require('./paginator');

var config = hexo.config;

module.exports = function(locals, render, callback){
  if (config.exclude_generator && config.exclude_generator.indexOf('tag') > -1) return callback();

  var mode = config.tag;

  if (!mode){
    if (mode == 0 || mode === false){
      return callback();
    } else {
      mode = 2;
    }
  }

  locals.tags.populate('posts').each(function(tag){
    if (!tag.length) return;

    var posts = tag.posts.sort('date', -1),
      path = tag.path;

    if (config == 2){
      paginator(path, posts, 'tag', render, {tag: tag.name});
    } else {
      posts.tag = tag.name;
      render(path, ['tag', 'archive', 'index'], posts);
    }
  });

  callback();
};
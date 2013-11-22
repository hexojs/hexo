var _ = require('lodash'),
  paginator = require('./paginator');

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

    var posts = tag.posts.sort('date', -1).populate('categories').populate('tags'),
      path = tag.path;

    if (mode == 2){
      paginator(path, posts, 'tag', render, {tag: tag.name});
    } else {
      render(path, ['tag', 'archive', 'index'], _.extend({posts: posts}, {tag: tag.name}));
    }
  });

  callback();
};
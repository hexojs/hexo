'use strict';

/**
 * Post path tag
 *
 * Syntax:
 *   {% post_path slug %}
 */
module.exports = function(ctx){
  var Post = ctx.model('Post');

  return function postPathTag(args){
    var slug = args.shift();
    if (!slug) return;

    var post = Post.findOne({slug: slug});
    if (!post) return;

    return ctx.config.root + post.path;
  };
};
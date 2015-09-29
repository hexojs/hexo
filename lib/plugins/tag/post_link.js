'use strict';

/**
 * Post link tag
 *
 * Syntax:
 *   {% post_link slug [title] %}
 */
module.exports = function(ctx) {
  var Post = ctx.model('Post');

  return function postLinkTag(args) {
    var slug = args.shift();
    if (!slug) return;

    var post = Post.findOne({slug: slug});
    if (!post) return;

    var title = args.length ? args.join(' ') : post.title;

    return '<a href="' + ctx.config.root + post.path + '" title="' + title + '">' + title + '</a>';
  };
};

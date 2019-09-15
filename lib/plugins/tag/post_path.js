'use strict';

/**
 * Post path tag
 *
 * Syntax:
 *   {% post_path slug %}
 */
module.exports = ctx => {
  const Post = ctx.model('Post');
  const url_for = require('../helper/url_for').bind(ctx);

  return function postPathTag(args) {
    const slug = args.shift();
    if (!slug) return;

    const post = Post.findOne({slug});
    if (!post) return;

    const link = url_for(post.path);

    return link;
  };
};

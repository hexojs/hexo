'use strict';

const url_for = require('../helper/url_for');

/**
 * Post path tag
 *
 * Syntax:
 *   {% post_path slug %}
 */
module.exports = ctx => {
  const Post = ctx.model('Post');

  return function postPathTag(args) {
    const slug = args.shift();
    if (!slug) return;

    const post = Post.findOne({slug});
    if (!post) return;

    const link = url_for.call(ctx, post.path);

    return link;
  };
};

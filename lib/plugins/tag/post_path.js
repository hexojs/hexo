'use strict';

const { resolve } = require('url');
const { encodeURL } = require('hexo-util');

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

    const link = encodeURL(resolve(ctx.config.root, post.path));

    return link;
  };
};

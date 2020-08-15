'use strict';

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

    const link = encodeURL((ctx.config.root + post.path).replace(/\\/g, '/').replace(/\/{2,}/g, '/'));

    return link;
  };
};

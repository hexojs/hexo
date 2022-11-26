'use strict';

const { resolve } = require('url');
const { encodeURL } = require('hexo-util');
const { postFindOneFactory } = require('./');

/**
 * Post path tag
 *
 * Syntax:
 *   {% post_path slug %}
 */
module.exports = ctx => {
  return function postPathTag(args) {
    const slug = args.shift();
    if (!slug) return;

    const post = postFindOneFactory(ctx)({ slug });
    if (!post) return;

    const link = encodeURL(resolve(ctx.config.root, post.path));

    return link;
  };
};

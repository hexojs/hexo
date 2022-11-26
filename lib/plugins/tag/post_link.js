'use strict';

const { encodeURL, escapeHTML } = require('hexo-util');
const { resolve } = require('url');
const { postFindOneFactory } = require('./');

/**
 * Post link tag
 *
 * Syntax:
 *   {% post_link slug [title] [escape] %}
 */
module.exports = ctx => {
  return function postLinkTag(args) {
    const slug = args.shift();
    if (!slug) {
      throw new Error(`Post not found: "${slug}" doesn't exist for {% post_link %}`);
    }

    let escape = args[args.length - 1];
    if (escape === 'true' || escape === 'false') {
      args.pop();
    } else {
      escape = 'true';
    }

    const post = postFindOneFactory(ctx)({ slug });
    if (!post) {
      throw new Error(`Post not found: post_link ${slug}.`);
    }

    let title = args.length ? args.join(' ') : post.title;
    // Let attribute be the true post title so it appears in tooltip.
    const attrTitle = escapeHTML(post.title);
    if (escape === 'true') title = escapeHTML(title);

    const link = encodeURL(resolve(ctx.config.root, post.path));

    return `<a href="${link}" title="${attrTitle}">${title}</a>`;
  };
};

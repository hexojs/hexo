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
    const error = `<a href="#">Post not found: ${args.join(' ') || 'Invalid post_link'}</a>`;
    const slug = args.shift();
    if (!slug) return error;

    let escape = args[args.length - 1];
    if (escape === 'true' || escape === 'false') {
      args.pop();
    } else {
      escape = 'true';
    }

    const post = postFindOneFactory(ctx)({ slug });
    if (!post) return error;

    let title = args.length ? args.join(' ') : post.title;
    const attrTitle = escapeHTML(title);
    if (escape === 'true') title = attrTitle;

    const link = encodeURL(resolve(ctx.config.root, post.path));

    return `<a href="${link}" title="${attrTitle}">${title}</a>`;
  };
};

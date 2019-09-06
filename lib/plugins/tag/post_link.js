'use strict';

const util = require('hexo-util');
const escapeHTML = util.escapeHTML;

/**
 * Post link tag
 *
 * Syntax:
 *   {% post_link slug [title] %}
 */
module.exports = ctx => {
  const Post = ctx.model('Post');

  return function postLinkTag(args) {
    const slug = args.shift();
    if (!slug) return;

    const post = Post.findOne({slug});
    if (!post) return;

    const title = escapeHTML(args.length ? args.join(' ') : post.title);

    return `<a href="${ctx.config.root}${post.path}" title="${title}">${title}</a>`;
  };
};

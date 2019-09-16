'use strict';

const { escapeHTML } = require('hexo-util');

/**
 * Post link tag
 *
 * Syntax:
 *   {% post_link slug [escape] [title] %}
 */
module.exports = ctx => {
  const Post = ctx.model('Post');

  return function postLinkTag(args) {
    const slug = args.shift();
    if (!slug) return;

    let escape = args[0];
    if (escape === 'true' || escape === 'false') {
      args.shift();
    } else {
      escape = 'true';
    }

    const post = Post.findOne({slug});
    if (!post) return;

    let title = args.length ? args.join(' ') : post.title;
    let attrTitle;
    if (escape === 'true') {
      attrTitle = title = escapeHTML(title);
    } else {
      attrTitle = escapeHTML(title);
    }

    return `<a href="${ctx.config.root}${post.path}" title="${attrTitle}">${title}</a>`;
  };
};

import { encodeURL, escapeHTML } from 'hexo-util';
import { postFindOneFactory } from './';
import type Hexo from '../../hexo';

/**
 * Post link tag
 *
 * Syntax:
 *   {% post_link slug | title [title] [escape] %}
 */
export = (ctx: Hexo) => {
  return function postLinkTag(args: string[]) {
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

    const factory = postFindOneFactory(ctx);
    const post = factory({ slug }) || factory({ title: slug });
    if (!post) {
      throw new Error(`Post not found: post_link ${slug}.`);
    }

    let title = args.length ? args.join(' ') : post.title || post.slug;
    // Let attribute be the true post title so it appears in tooltip.
    const attrTitle = escapeHTML(post.title || post.slug);
    if (escape === 'true') title = escapeHTML(title);

    const link = encodeURL(new URL(post.path, ctx.config.url).pathname);

    return `<a href="${link}" title="${attrTitle}">${title}</a>`;
  };
};

import { encodeURL } from 'hexo-util';
import { postFindOneFactory } from './';

/**
 * Post path tag
 *
 * Syntax:
 *   {% post_path slug | title %}
 */
export = ctx => {
  return function postPathTag(args) {
    const slug = args.shift();
    if (!slug) return;

    const factory = postFindOneFactory(ctx);
    const post = factory({ slug }) || factory({ title: slug });
    if (!post) return;

    const link = encodeURL(new URL(post.path, ctx.config.url).pathname);

    return link;
  };
};

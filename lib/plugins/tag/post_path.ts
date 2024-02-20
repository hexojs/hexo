import { url_for } from 'hexo-util';
import { postFindOneFactory } from './';
import type Hexo from '../../hexo';

/**
 * Post path tag
 *
 * Syntax:
 *   {% post_path slug | title %}
 */
export = (ctx: Hexo) => {
  return function postPathTag(args: any[]) {
    const slug = args.shift();
    if (!slug) return;

    const factory = postFindOneFactory(ctx);
    const post = factory({ slug }) || factory({ title: slug });
    if (!post) return;

    const link = url_for.call(ctx, post.path);

    return link;
  };
};

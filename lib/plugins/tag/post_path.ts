import { url_for } from 'hexo-util';
import { postFindOneFactory } from './';
import type Hexo from '../../hexo';

/**
 * Post path tag
 *
 * Syntax:
 *   {% post_path slug | title %}
 */
const postPath = (ctx: Hexo) => {
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

// For ESM compatibility
export default postPath;
// For CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = postPath;
  // For ESM compatibility
  module.exports.default = postPath;
}

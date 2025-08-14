import { url_for } from 'hexo-util';
import type Hexo from '../../hexo/index.js';

/**
 * Asset path tag
 *
 * Syntax:
 *   {% asset_path slug %}
 */
const assetPath = (ctx: Hexo) => {
  const PostAsset = ctx.model('PostAsset');

  return function assetPathTag(args: string[]) {
    const slug = args.shift();
    if (!slug) return;

    const asset = PostAsset.findOne({post: this._id, slug});
    if (!asset) return;

    const path = url_for.call(ctx, asset.path);

    return path;
  };
};

// For ESM compatibility
export default assetPath;
// For CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = assetPath;
  // For ESM compatibility
  module.exports.default = assetPath;
}

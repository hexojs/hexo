import { encodeURL } from 'hexo-util';

/**
 * Asset path tag
 *
 * Syntax:
 *   {% asset_path slug %}
 */
export = ctx => {
  const PostAsset = ctx.model('PostAsset');

  return function assetPathTag(args) {
    const slug = args.shift();
    if (!slug) return;

    const asset = PostAsset.findOne({post: this._id, slug});
    if (!asset) return;

    const path = encodeURL(new URL(asset.path, ctx.config.url).pathname);

    return path;
  };
};

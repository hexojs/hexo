import img from './img';
import { encodeURL } from 'hexo-util';

/**
 * Asset image tag
 *
 * Syntax:
 *   {% asset_img [class names] slug [width] [height] [title text [alt text]]%}
 */
export = ctx => {
  const PostAsset = ctx.model('PostAsset');

  return function assetImgTag(args) {
    const len = args.length;

    // Find image URL
    for (let i = 0; i < len; i++) {
      const asset = PostAsset.findOne({post: this._id, slug: args[i]});
      if (asset) {
        args[i] = encodeURL(new URL(asset.path, ctx.config.url).pathname);
        return img(ctx)(args);
      }
    }
  };
};

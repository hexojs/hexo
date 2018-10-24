'use strict';

const url = require('url');
const img = require('./img');

/**
 * Asset image tag
 *
 * Syntax:
 *   {% asset_img [class names] slug [width] [height] [title text [alt text]]%}
 */
module.exports = ctx => {
  const PostAsset = ctx.model('PostAsset');

  return function assetImgTag(args) {
    const len = args.length;

    // Find image URL
    for (let i = 0; i < len; i++) {
      const asset = PostAsset.findOne({post: this._id, slug: args[i]});
      if (asset) {
        args[i] = url.resolve('/', asset.path);
        return img(ctx)(args);
      }
    }
  };
};

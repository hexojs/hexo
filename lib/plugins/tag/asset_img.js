'use strict';

const { resolve } = require('url');
const img = require('./img');
const { encodeURL } = require('hexo-util');

/**
 * Asset image tag
 *
 * Syntax:
 *   {% asset_img [class names] slug [width] [height] [title text [alt text]]%}
 */
module.exports = ctx => {
  const PostAsset = ctx.model('PostAsset');

  return function assetImgTag(args) {
    // Find image URL
    for (let i = 0; i < args.length; i++) {
      const asset = PostAsset.findOne({post: this._id, slug: args[i]});
      if (asset) {
        args[i] = encodeURL(resolve('/', asset.path));
        return img(ctx)(args);
      }
    }
  };
};

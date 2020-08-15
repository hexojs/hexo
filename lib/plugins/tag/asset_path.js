'use strict';

const { encodeURL } = require('hexo-util');

/**
 * Asset path tag
 *
 * Syntax:
 *   {% asset_path slug %}
 */
module.exports = ctx => {
  const PostAsset = ctx.model('PostAsset');

  return function assetPathTag(args) {
    const slug = args.shift();
    if (!slug) return;

    const asset = PostAsset.findOne({post: this._id, slug});
    if (!asset) return;

    const path = encodeURL((ctx.config.root + asset.path).replace(/\\/g, '/').replace(/\/{2,}/g, '/'));

    return path;
  };
};

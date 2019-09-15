'use strict';

/**
 * Asset path tag
 *
 * Syntax:
 *   {% asset_path slug %}
 */
module.exports = ctx => {
  const PostAsset = ctx.model('PostAsset');
  const url_for = require('../helper/url_for').bind(ctx);

  return function assetPathTag(args) {
    const slug = args.shift();
    if (!slug) return;

    const asset = PostAsset.findOne({post: this._id, slug});
    if (!asset) return;

    const path = url_for(asset.path);

    return path;
  };
};

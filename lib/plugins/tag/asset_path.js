'use strict';

const { encodeURL } = require('hexo-util');
const url_for = require('../../plugins/helper/url_for');

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

    const path = encodeURL(url_for.call(ctx, asset.path));

    return path;
  };
};

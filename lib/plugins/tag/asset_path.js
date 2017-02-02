'use strict';

var url = require('url');

/**
 * Asset path tag
 *
 * Syntax:
 *   {% asset_path slug %}
 */
module.exports = function(ctx) {
  var PostAsset = ctx.model('PostAsset');

  return function assetPathTag(args) {
    var slug = args.shift();
    if (!slug) return;

    var asset = PostAsset.findOne({post: this._id, slug: slug});
    if (!asset) return;

    return url.resolve(ctx.config.root, asset.path);
  };
};

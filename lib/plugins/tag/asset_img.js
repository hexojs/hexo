'use strict';

var url = require('url');

/**
 * Asset image tag
 *
 * Syntax:
 *   {% asset_img slug [title]%}
 */
module.exports = function(ctx) {
  var PostAsset = ctx.model('PostAsset');

  return function assetImgTag(args) {
    var slug = args.shift();
    if (!slug) return;

    var asset = PostAsset.findOne({post: this._id, slug: slug});
    if (!asset) return;

    // if title is not assigned, set it ''
    var title = args.length ? args.join(' ') : '';
    // alt always exist
    var alt = title || asset.slug;

    return '<img src="' + url.resolve(ctx.config.root, asset.path) + '" alt="' + alt + '" title="' + title + '">';
  };
};

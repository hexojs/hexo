'use strict';

/**
 * Asset image tag
 *
 * Syntax:
 *   {% asset_img slug %}
 */
module.exports = function(ctx){
  var PostAsset = ctx.model('PostAsset');

  return function assetImgTag(args){
    var slug = args.shift();
    if (!slug) return;

    var asset = PostAsset.findOne({post: this._id, slug: slug});
    if (!asset) return;

    return '<img src="' + ctx.config.root + asset.path + '">';
  };
};
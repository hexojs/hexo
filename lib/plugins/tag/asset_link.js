'use strict';

/**
 * Asset link tag
 *
 * Syntax:
 *   {% asset_link slug [title] %}
 */
module.exports = function(ctx){
  var PostAsset = ctx.model('PostAsset');

  return function assetLinkTag(args){
    var slug = args.shift();
    if (!slug) return;

    var asset = PostAsset.findOne({post: this._id, slug: slug});
    if (!asset) return;

    var title = args.length ? args.join(' ') : asset.slug;

    return '<a href="' + ctx.config.root + asset.path + '" title="' + title + '">' + title + '</a>';
  };
};
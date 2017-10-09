'use strict';

var url = require('url');
var img = require('./img');

/**
 * Asset image tag
 *
 * Syntax:
 *   {% asset_img [class names] slug [width] [height] [title text [alt text]]%}
 */
module.exports = function(ctx) {
  var PostAsset = ctx.model('PostAsset');

  return function assetImgTag(args) {
    var asset;
    var item = '';
    var i = 0;
    var len = args.length;

    // Find image URL
    for (; i < len; i++) {
      item = args[i];
      asset = PostAsset.findOne({post: this._id, slug: item});
      if (asset) break;
    }

    if (!asset) return;

    args[i] = url.resolve(ctx.config.root, asset.path);

    return img(ctx)(args);
  };
};

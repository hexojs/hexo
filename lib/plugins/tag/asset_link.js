'use strict';

const url = require('url');

/**
 * Asset link tag
 *
 * Syntax:
 *   {% asset_link slug [title] %}
 */
module.exports = ctx => {
  const PostAsset = ctx.model('PostAsset');

  return function assetLinkTag(args) {
    const slug = args.shift();
    if (!slug) return;

    const asset = PostAsset.findOne({post: this._id, slug});
    if (!asset) return;

    const title = args.length ? args.join(' ') : asset.slug;

    return `<a href="${url.resolve(ctx.config.root, asset.path)}" title="${title}">${title}</a>`;
  };
};

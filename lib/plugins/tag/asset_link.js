'use strict';

const url = require('url');
const { escapeHTML } = require('hexo-util');

/**
 * Asset link tag
 *
 * Syntax:
 *   {% asset_link slug [escape] [title] %}
 */
module.exports = ctx => {
  const PostAsset = ctx.model('PostAsset');

  return function assetLinkTag(args) {
    const slug = args.shift();
    if (!slug) return;

    const asset = PostAsset.findOne({post: this._id, slug});
    if (!asset) return;

    let escape = args[0];
    if (escape === 'true' || escape === 'false') {
      args.shift();
    } else {
      escape = 'false';
    }

    let title = args.length ? args.join(' ') : asset.slug;
    let attrTitle;
    if (escape === 'true') {
      attrTitle = title = escapeHTML(title);
    } else {
      attrTitle = escapeHTML(title);
    }

    return `<a href="${url.resolve(ctx.config.root, asset.path)}" title="${attrTitle}">${title}</a>`;
  };
};

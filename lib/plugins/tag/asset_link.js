'use strict';

const url = require('url');
const { encodeURL, escapeHTML } = require('hexo-util');

/**
 * Asset link tag
 *
 * Syntax:
 *   {% asset_link slug [title] [escape] %}
 */
module.exports = ctx => {
  const PostAsset = ctx.model('PostAsset');
  const url_for = require('../../plugins/helper/url_for').bind(ctx);

  return function assetLinkTag(args) {
    const slug = args.shift();
    if (!slug) return;

    const asset = PostAsset.findOne({post: this._id, slug});
    if (!asset) return;

    let escape = args[args.length - 1];
    if (escape === 'true' || escape === 'false') {
      args.pop();
    } else {
      escape = 'true';
    }

    let title = args.length ? args.join(' ') : asset.slug;
    const attrTitle = escapeHTML(title);
    if (escape === 'true') title = attrTitle;

    return `<a href="${url.resolve(ctx.config.root, asset.path)}" title="${attrTitle}">${title}</a>`;
  };
};

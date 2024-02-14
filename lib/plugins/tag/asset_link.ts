import { encodeURL, escapeHTML } from 'hexo-util';
import type Hexo from '../../hexo';

/**
 * Asset link tag
 *
 * Syntax:
 *   {% asset_link slug [title] [escape] %}
 */
export = (ctx: Hexo) => {
  const PostAsset = ctx.model('PostAsset');

  return function assetLinkTag(args: string[]) {
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

    const link = encodeURL(new URL(asset.path, ctx.config.url).pathname);

    return `<a href="${link}" title="${attrTitle}">${title}</a>`;
  };
};

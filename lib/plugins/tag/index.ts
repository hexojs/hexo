import * as moizeModule from 'moize';
import type Hexo from '../../hexo/index.js';
import blockquote from './blockquote.js';
import code from './code.js';
import iframe from './iframe.js';
import img from './img.js';
import includeCode from './include_code.js';
import link from './link.js';
import postPath from './post_path.js';
import postLink from './post_link.js';
import assetPath from './asset_path.js';
import assetLink from './asset_link.js';
import assetImg from './asset_img.js';
import pullquote from './pullquote.js';
import urlFor from './url_for.js';
import fullUrlFor from './full_url_for.js';

// ESM compatibility
const moize = (moizeModule.default || moizeModule) as unknown as moizeModule.Moize;

export default (ctx: Hexo) => {
  const { tag } = ctx.extend;

  tag.register('quote', blockquote(ctx), true);
  tag.register('blockquote', blockquote(ctx), true);

  tag.register('code', code(ctx), true);
  tag.register('codeblock', code(ctx), true);

  tag.register('iframe', iframe);

  tag.register('img', img(ctx));
  tag.register('image', img(ctx));

  tag.register('include_code', includeCode(ctx), {async: true});
  tag.register('include-code', includeCode(ctx), {async: true});

  tag.register('a', link);
  tag.register('link', link);
  tag.register('anchor', link);

  tag.register('post_path', postPath(ctx));
  tag.register('post_link', postLink(ctx));

  tag.register('asset_path', assetPath(ctx));
  tag.register('asset_link', assetLink(ctx));

  tag.register('asset_img', assetImg(ctx));
  tag.register('asset_image', assetImg(ctx));

  tag.register('pullquote', pullquote(ctx), true);

  tag.register('url_for', urlFor(ctx));
  tag.register('full_url_for', fullUrlFor(ctx));
};

// Use WeakMap to track different ctx (in case there is any)
const moized = new WeakMap();

export function postFindOneFactory(ctx: Hexo) {
  if (moized.has(ctx)) {
    return moized.get(ctx);
  }

  const moizedPostFindOne = moize(createPostFindOne(ctx), {
    isDeepEqual: true,
    maxSize: 20
  });
  moized.set(ctx, moizedPostFindOne);

  return moizedPostFindOne;
}

function createPostFindOne(ctx: Hexo) {
  const Post = ctx.model('Post');
  return Post.findOne.bind(Post);
}

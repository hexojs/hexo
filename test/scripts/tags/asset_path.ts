import BluebirdPromise from 'bluebird';
import Hexo from '../../../lib/hexo';
import tagAssetPath from '../../../lib/plugins/tag/asset_path';
import chai from 'chai';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const should = chai.should();

// Cross-compatible __dirname for ESM and CJS, without require
let __hexo_dirname: string;
if (typeof __dirname !== 'undefined') {
  // CJS
  __hexo_dirname = __dirname;
} else {
  // ESM (only works in ESM context)
  let url = '';
  try {
    // @ts-ignore: import.meta.url is only available in ESM, safe to ignore in CJS
    url = import.meta.url;
  } catch {}
  __hexo_dirname = url ? dirname(fileURLToPath(url)) : '';
}

describe('asset_path', () => {
  const hexo = new Hexo(__hexo_dirname);
  const assetPathTag = tagAssetPath(hexo);
  const Post = hexo.model('Post');
  const PostAsset = hexo.model('PostAsset');
  let post;

  hexo.config.permalink = ':title/';

  function assetPath(args) {
    return assetPathTag.call(post, args.split(' '));
  }

  before(() => hexo.init().then(() => Post.insert({
    source: 'foo.md',
    slug: 'foo'
  })).then(post_ => {
    post = post_;

    return BluebirdPromise.all([
      PostAsset.insert({
        _id: 'bar',
        slug: 'bar',
        post: post._id
      }),
      PostAsset.insert({
        _id: 'bár',
        slug: 'bár',
        post: post._id
      }),
      PostAsset.insert({
        _id: 'spaced asset',
        slug: 'spaced asset',
        post: post._id
      })
    ]);
  }));

  it('default', () => {
    assetPath('bar').should.eql('/foo/bar');
  });

  it('should encode path', () => {
    assetPath('bár').should.eql('/foo/b%C3%A1r');
  });

  it('with space', () => {
    // {% asset_path "spaced asset" %}
    assetPathTag.call(post, ['spaced asset'])
      .should.eql('/foo/spaced%20asset');
  });

  it('no slug', () => {
    should.not.exist(assetPath(''));
  });

  it('asset not found', () => {
    should.not.exist(assetPath('boo'));
  });
});

'use strict';

const Promise = require('bluebird');

describe('asset_path', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo(__dirname);
  const assetPathTag = require('../../../dist/plugins/tag/asset_path')(hexo);
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

    return Promise.all([
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

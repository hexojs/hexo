'use strict';

const Promise = require('bluebird');

describe('asset_img', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo(__dirname);
  const assetImgTag = require('../../../dist/plugins/tag/asset_img')(hexo);
  const Post = hexo.model('Post');
  const PostAsset = hexo.model('PostAsset');
  let post;

  hexo.config.permalink = ':title/';

  function assetImg(args) {
    return assetImgTag.call(post, args.split(' '));
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
    assetImg('bar').should.eql('<img src="/foo/bar" class="">');
  });

  it('should encode path', () => {
    assetImg('bár').should.eql('<img src="/foo/b%C3%A1r" class="">');
  });

  it('default', () => {
    assetImg('bar "a title"').should.eql('<img src="/foo/bar" class="" title="a title">');
  });

  it('with space', () => {
    // {% asset_img "spaced asset" "spaced title" %}
    assetImgTag.call(post, ['spaced asset', 'spaced title'])
      .should.eql('<img src="/foo/spaced%20asset" class="" title="spaced title">');
  });

  it('with alt and title', () => {
    assetImgTag.call(post, ['bar', '"a title"', '"an alt"'])
      .should.eql('<img src="/foo/bar" class="" title="a title" alt="an alt">');
  });

  it('with width height alt and title', () => {
    assetImgTag.call(post, ['bar', '100', '200', '"a title"', '"an alt"'])
      .should.eql('<img src="/foo/bar" class="" width="100" height="200" title="a title" alt="an alt">');
  });

  it('no slug', () => {
    should.not.exist(assetImg(''));
  });

  it('asset not found', () => {
    should.not.exist(assetImg('boo'));
  });

  it('with root path', () => {
    hexo.config.root = '/root/';
    assetImg('bar').should.eql('<img src="/root/foo/bar" class="">');
  });
});

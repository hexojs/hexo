var should = require('chai').should(); // eslint-disable-line
var Promise = require('bluebird');

describe('asset_img', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);
  var assetImgTag = require('../../../lib/plugins/tag/asset_img')(hexo);
  var Post = hexo.model('Post');
  var PostAsset = hexo.model('PostAsset');
  var post;

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
        _id: 'spaced asset',
        slug: 'spaced asset',
        post: post._id
      })
    ]);
  }));

  it('default', () => {
    assetImg('bar').should.eql('<img src="/foo/bar" alt="bar" title="">');
  });

  it('default', () => {
    assetImg('bar title').should.eql('<img src="/foo/bar" alt="title" title="title">');
  });

  it('with space', () => {
    // {% asset_img "spaced asset" "spaced title" %}
    assetImgTag.call(post, ['spaced asset', 'spaced title'])
      .should.eql('<img src="/foo/spaced%20asset" alt="spaced title" title="spaced title">');
  });

  it('no slug', () => {
    should.not.exist(assetImg(''));
  });

  it('asset not found', () => {
    should.not.exist(assetImg('boo'));
  });
});

'use strict';

var should = require('chai').should(); // eslint-disable-line

describe('asset_img', function() {
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

  before(function() {
    return hexo.init().then(function() {
      return Post.insert({
        source: 'foo.md',
        slug: 'foo'
      });
    }).then(function(post_) {
      post = post_;

      return PostAsset.insert({
        _id: 'bar',
        slug: 'bar',
        post: post._id
      });
    });
  });

  it('default', function() {
    assetImg('bar').should.eql('<img src="/foo/bar" alt="bar" title="">');
  });

  it('default', function() {
    assetImg('bar title').should.eql('<img src="/foo/bar" alt="title" title="title">');
  });

  it('no slug', function() {
    should.not.exist(assetImg(''));
  });

  it('asset not found', function() {
    should.not.exist(assetImg('boo'));
  });
});

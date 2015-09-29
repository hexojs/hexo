'use strict';

var should = require('chai').should(); // eslint-disable-line

describe('asset_path', function() {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);
  var assetPathTag = require('../../../lib/plugins/tag/asset_path')(hexo);
  var Post = hexo.model('Post');
  var PostAsset = hexo.model('PostAsset');
  var post;

  hexo.config.permalink = ':title/';

  function assetPath(args) {
    return assetPathTag.call(post, args.split(' '));
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
    assetPath('bar').should.eql('/foo/bar');
  });

  it('no slug', function() {
    should.not.exist(assetPath(''));
  });

  it('asset not found', function() {
    should.not.exist(assetPath('boo'));
  });
});

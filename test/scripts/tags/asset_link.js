var should = require('chai').should();

describe('asset_link', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);
  var assetLinkTag = require('../../../lib/plugins/tag/asset_link')(hexo);
  var Post = hexo.model('Post');
  var PostAsset = hexo.model('PostAsset');
  var post;

  hexo.config.permalink = ':title/';

  function assetLink(args){
    return assetLinkTag.call(post, args.split(' '));
  }

  before(function(){
    return hexo.init().then(function(){
      return Post.insert({
        source: 'foo.md',
        slug: 'foo'
      });
    }).then(function(post_){
      post = post_;

      return PostAsset.insert({
        _id: 'bar',
        slug: 'bar',
        post: post._id
      });
    });
  });

  it('default', function(){
    assetLink('bar').should.eql('<a href="/foo/bar" title="bar">bar</a>');
  });

  it('title', function(){
    assetLink('bar Hello world').should.eql('<a href="/foo/bar" title="Hello world">Hello world</a>');
  });

  it('no slug', function(){
    should.not.exist(assetLink(''));
  });

  it('asset not found', function(){
    should.not.exist(assetLink('boo'));
  });
});
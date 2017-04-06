var should = require('chai').should(); // eslint-disable-line
var Promise = require('bluebird');

describe('asset_link', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);
  var assetLinkTag = require('../../../lib/plugins/tag/asset_link')(hexo);
  var Post = hexo.model('Post');
  var PostAsset = hexo.model('PostAsset');
  var post;

  hexo.config.permalink = ':title/';

  function assetLink(args) {
    return assetLinkTag.call(post, args.split(' '));
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
    assetLink('bar').should.eql('<a href="/foo/bar" title="bar">bar</a>');
  });

  it('title', () => {
    assetLink('bar Hello world').should.eql('<a href="/foo/bar" title="Hello world">Hello world</a>');
  });

  it('with space', () => {
    // {% asset_link "spaced asset" "spaced title" %}
    assetLinkTag.call(post, ['spaced asset', 'spaced title'])
      .should.eql('<a href="/foo/spaced%20asset" title="spaced title">spaced title</a>');
  });

  it('no slug', () => {
    should.not.exist(assetLink(''));
  });

  it('asset not found', () => {
    should.not.exist(assetLink('boo'));
  });
});

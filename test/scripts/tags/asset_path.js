var should = require('chai').should(); // eslint-disable-line
var Promise = require('bluebird');

describe('asset_path', () => {
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
    assetPath('bar').should.eql('/foo/bar');
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

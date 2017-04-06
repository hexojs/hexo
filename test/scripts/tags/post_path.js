var should = require('chai').should(); // eslint-disable-line

describe('post_path', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);
  var postPath = require('../../../lib/plugins/tag/post_path')(hexo);
  var Post = hexo.model('Post');

  hexo.config.permalink = ':title/';

  before(() => hexo.init().then(() => Post.insert({
    source: 'foo',
    slug: 'foo'
  })));

  it('default', () => {
    postPath(['foo']).should.eql('/foo/');
  });

  it('no slug', () => {
    should.not.exist(postPath([]));
  });

  it('post not found', () => {
    should.not.exist(postPath(['bar']));
  });
});

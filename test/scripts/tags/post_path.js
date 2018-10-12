const should = require('chai').should(); // eslint-disable-line

describe('post_path', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(__dirname);
  const postPath = require('../../../lib/plugins/tag/post_path')(hexo);
  const Post = hexo.model('Post');

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

'use strict';

describe('post_path', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo(__dirname);
  const postPath = require('../../../dist/plugins/tag/post_path')(hexo);
  const Post = hexo.model('Post');

  hexo.config.permalink = ':title/';

  before(() => hexo.init().then(() => Post.insert([{
    source: 'foo',
    slug: 'foo'
  }, {
    source: 'fôo',
    slug: 'fôo'
  }])));

  it('default', () => {
    postPath(['foo']).should.eql('/foo/');
  });

  it('should encode path', () => {
    postPath(['fôo']).should.eql('/f%C3%B4o/');
  });

  it('no slug', () => {
    should.not.exist(postPath([]));
  });

  it('post not found', () => {
    should.not.exist(postPath(['bar']));
  });
});

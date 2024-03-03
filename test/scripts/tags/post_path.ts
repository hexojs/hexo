import Hexo from '../../../lib/hexo';
import tagPostPath from '../../../lib/plugins/tag/post_path';
import chai from 'chai';
const should = chai.should();

describe('post_path', () => {
  const hexo = new Hexo(__dirname);
  const postPath = tagPostPath(hexo);
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

import Hexo from '../../../lib/hexo';
import tagPostPath from '../../../lib/plugins/tag/post_path';
import chai from 'chai';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const should = chai.should();

// Cross-compatible __dirname for ESM and CJS, without require
let __hexo_dirname: string;
if (typeof __dirname !== 'undefined') {
  // CJS
  __hexo_dirname = __dirname;
} else {
  // ESM (only works in ESM context)
  let url = '';
  try {
    // @ts-ignore: import.meta.url is only available in ESM, safe to ignore in CJS
    url = import.meta.url;
  } catch {}
  __hexo_dirname = url ? dirname(fileURLToPath(url)) : '';
}

describe('post_path', () => {
  const hexo = new Hexo(__hexo_dirname);
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

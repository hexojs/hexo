'use strict';

describe('post_link', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo(__dirname);
  const postLink = require('../../../dist/plugins/tag/post_link')(hexo);
  const Post = hexo.model('Post');

  hexo.config.permalink = ':title/';

  before(() => hexo.init().then(() => Post.insert([{
    source: 'foo',
    slug: 'foo',
    title: 'Hello world'
  },
  {
    source: 'title-with-tag',
    slug: 'title-with-tag',
    title: '"Hello" <new world>!'
  },
  {
    source: 'fôo',
    slug: 'fôo',
    title: 'Hello world'
  },
  {
    source: 'no-title',
    slug: 'no-title',
    title: ''
  }])));

  it('default', () => {
    postLink(['foo']).should.eql('<a href="/foo/" title="Hello world">Hello world</a>');
  });

  it('should encode path', () => {
    postLink(['fôo']).should.eql('<a href="/f%C3%B4o/" title="Hello world">Hello world</a>');
  });

  it('title', () => {
    postLink(['foo', 'test']).should.eql('<a href="/foo/" title="Hello world">test</a>');
  });

  it('no title', () => {
    postLink(['no-title']).should.eql('<a href="/no-title/" title="no-title">no-title</a>');
  });

  it('should escape tag in title by default', () => {
    postLink(['title-with-tag']).should.eql('<a href="/title-with-tag/" title="&quot;Hello&quot; &lt;new world&gt;!">&quot;Hello&quot; &lt;new world&gt;!</a>');
  });

  it('should escape tag in title', () => {
    postLink(['title-with-tag', 'true']).should.eql('<a href="/title-with-tag/" title="&quot;Hello&quot; &lt;new world&gt;!">&quot;Hello&quot; &lt;new world&gt;!</a>');
  });

  it('should escape tag in custom title', () => {
    postLink(['title-with-tag', '<test>', 'title', 'true']).should.eql('<a href="/title-with-tag/" title="&quot;Hello&quot; &lt;new world&gt;!">&lt;test&gt; title</a>');
  });

  it('should not escape tag in title', () => {
    postLink(['title-with-tag', 'false']).should.eql('<a href="/title-with-tag/" title="&quot;Hello&quot; &lt;new world&gt;!">"Hello" <new world>!</a>');
  });

  it('should not escape tag in custom title', () => {
    postLink(['title-with-tag', 'This is a <b>Bold</b> "statement"', 'false'])
      .should.eql('<a href="/title-with-tag/" title="&quot;Hello&quot; &lt;new world&gt;!">This is a <b>Bold</b> "statement"</a>');
  });

  it('should throw if no slug', () => {
    should.throw(() => postLink([]), Error, /Post not found: "undefined" doesn't exist for \{% post_link %\}/);
  });

  it('should throw if post not found', () => {
    should.throw(() => postLink(['bar']), Error, /Post not found: post_link bar\./);
  });

  it('should keep hash', () => {
    postLink(['foo#bar']).should.eql('<a href="/foo/#bar" title="Hello world">Hello world</a>');
  });
});

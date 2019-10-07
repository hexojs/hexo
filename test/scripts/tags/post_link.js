'use strict';

describe('post_link', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(__dirname);
  const postLink = require('../../../lib/plugins/tag/post_link')(hexo);
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
  }])));

  it('default', () => {
    postLink(['foo']).should.eql('<a href="/foo/" title="Hello world">Hello world</a>');
  });

  it('should encode path', () => {
    postLink(['fôo']).should.eql('<a href="/f%C3%B4o/" title="Hello world">Hello world</a>');
  });

  it('title', () => {
    postLink(['foo', 'test']).should.eql('<a href="/foo/" title="test">test</a>');
  });

  it('should escape tag in title by default', () => {
    postLink(['title-with-tag']).should.eql('<a href="/title-with-tag/" title="&quot;Hello&quot; &lt;new world&gt;!">&quot;Hello&quot; &lt;new world&gt;!</a>');
  });

  it('should escape tag in title', () => {
    postLink(['title-with-tag', 'true']).should.eql('<a href="/title-with-tag/" title="&quot;Hello&quot; &lt;new world&gt;!">&quot;Hello&quot; &lt;new world&gt;!</a>');
  });

  it('should escape tag in custom title', () => {
    postLink(['title-with-tag', '<test>', 'title', 'true']).should.eql('<a href="/title-with-tag/" title="&lt;test&gt; title">&lt;test&gt; title</a>');
  });

  it('should not escape tag in title', () => {
    postLink(['title-with-tag', 'false']).should.eql('<a href="/title-with-tag/" title="&quot;Hello&quot; &lt;new world&gt;!">"Hello" <new world>!</a>');
  });

  it('should not escape tag in custom title', () => {
    postLink(['title-with-tag', 'This is a <b>Bold</b> "statement"', 'false'])
      .should.eql('<a href="/title-with-tag/" title="This is a &lt;b&gt;Bold&lt;&#x2F;b&gt; &quot;statement&quot;">This is a <b>Bold</b> "statement"</a>');
  });

  it('no slug', () => {
    should.not.exist(postLink([]));
  });

  it('post not found', () => {
    should.not.exist(postLink(['bar']));
  });
});

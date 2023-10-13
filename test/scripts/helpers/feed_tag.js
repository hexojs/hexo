'use strict';

describe('feed_tag', () => {
  const ctx = {
    config: {
      title: 'Hexo',
      url: 'http://example.com',
      root: '/',
      feed: {}
    }
  };

  beforeEach(() => { ctx.config.feed = {}; });

  const feed = require('../../../dist/plugins/helper/feed_tag').bind(ctx);

  it('path - atom', () => {
    feed('atom.xml').should.eql('<link rel="alternate" href="/atom.xml" title="Hexo" type="application/atom+xml">');
  });

  it('path - rss', () => {
    feed('rss2.xml').should.eql('<link rel="alternate" href="/rss2.xml" title="Hexo" type="application/rss+xml">');
  });

  it('title', () => {
    feed('atom.xml', {title: 'RSS Feed'}).should.eql('<link rel="alternate" href="/atom.xml" title="RSS Feed" type="application/atom+xml">');
  });

  it('type', () => {
    feed('rss.xml', {type: 'rss'}).should.eql('<link rel="alternate" href="/rss.xml" title="Hexo" type="application/rss+xml">');
  });

  it('type - null', () => {
    feed('foo.xml', {type: null}).should.eql('<link rel="alternate" href="/foo.xml" title="Hexo" >');
  });

  it('invalid input - number', () => {
    should.throw(() => feed(123), 'path must be a string!');
  });

  it('invalid input - undefined', () => {
    delete ctx.config.feed;
    feed().should.eql('');
  });

  it('invalid input - empty', () => {
    ctx.config.feed = {};
    feed().should.eql('');
  });

  it('feed - parse argument if available', () => {
    ctx.config.feed = {
      type: 'atom',
      path: 'atom.xml'
    };

    feed('atomic.xml').should.eql('<link rel="alternate" href="/atomic.xml" title="Hexo" type="application/atom+xml">');
  });

  it('feed - atom', () => {
    ctx.config.feed = {
      type: 'atom',
      path: 'atom.xml'
    };

    feed().should.eql('<link rel="alternate" href="/atom.xml" title="Hexo" type="application/atom+xml">');
  });

  it('feed - rss2', () => {
    ctx.config.feed = {
      type: 'rss2',
      path: 'rss.xml'
    };

    feed().should.eql('<link rel="alternate" href="/rss.xml" title="Hexo" type="application/rss+xml">');
  });

  it('feed - rss2', () => {
    ctx.config.feed = {
      type: ['atom', 'rss2'],
      path: ['atom.xml', 'rss.xml']
    };

    feed().should.eql([
      '<link rel="alternate" href="/atom.xml" title="Hexo" type="application/atom+xml">',
      '<link rel="alternate" href="/rss.xml" title="Hexo" type="application/rss+xml">'
    ].join(''));
  });
});

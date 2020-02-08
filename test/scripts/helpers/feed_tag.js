'use strict';

describe('feed_tag', () => {
  const ctx = {
    config: {
      title: 'Hexo',
      url: 'http://yoursite.com',
      root: '/',
      feed: {}
    }
  };

  beforeEach(() => { ctx.config.feed = {}; });

  ctx.url_for = require('../../../lib/plugins/helper/url_for').bind(ctx);

  const feed = require('../../../lib/plugins/helper/feed_tag').bind(ctx);

  it('path', () => {
    feed('atom.xml').should.eql('<link rel="alternate" href="/atom.xml" title="Hexo" type="application/atom+xml">');
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
    ctx.config.feed = {};
    const result = feed();
    const typeOf = str => typeof str;

    typeOf(result).should.eql('string');
    result.should.to.have.lengthOf(0);
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

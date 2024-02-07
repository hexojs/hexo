import feedTag from '../../../lib/plugins/helper/feed_tag';
import chai from 'chai';
const should = chai.should();
type FeedTagParams = Parameters<typeof feedTag>;
type FeedTagReturn = ReturnType<typeof feedTag>;

describe('feed_tag', () => {
  const ctx: any = {
    config: {
      title: 'Hexo',
      url: 'http://example.com',
      root: '/',
      feed: {}
    }
  };

  beforeEach(() => { ctx.config.feed = {}; });

  const feed: (...args: FeedTagParams) => FeedTagReturn = feedTag.bind(ctx);

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
    // @ts-ignore
    should.throw(() => feed(123), 'path must be a string!');
  });

  it('invalid input - undefined', () => {
    delete ctx.config.feed;
    // @ts-ignore
    feed().should.eql('');
  });

  it('invalid input - empty', () => {
    ctx.config.feed = {};
    // @ts-ignore
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

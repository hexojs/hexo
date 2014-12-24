var should = require('chai').should();

describe('feed_tag', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);
  var urlHelper = require('../../../lib/plugins/helper/url');

  var ctx = {
    config: hexo.config
  };

  ctx.url_for = urlHelper.url_for.bind(ctx);

  var feed = require('../../../lib/plugins/helper/feed_tag').bind(ctx);

  it('path', function(){
    feed('atom.xml').should.eql('<link rel="alternative" href="/atom.xml" title="Hexo" type="application/atom+xml">');
  });

  it('title', function(){
    feed('atom.xml', {title: 'RSS Feed'}).should.eql('<link rel="alternative" href="/atom.xml" title="RSS Feed" type="application/atom+xml">');
  });

  it('type', function(){
    feed('rss.xml', {type: 'rss'}).should.eql('<link rel="alternative" href="/rss.xml" title="Hexo" type="application/rss+xml">');
  });
});
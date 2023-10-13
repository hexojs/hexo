'use strict';

describe('full_url_for', () => {
  const ctx = {
    config: { url: 'https://example.com' }
  };

  const fullUrlFor = require('../../../dist/plugins/helper/full_url_for').bind(ctx);

  it('no path input', () => {
    fullUrlFor().should.eql(ctx.config.url + '/');
  });

  it('internal url', () => {
    fullUrlFor('index.html').should.eql(ctx.config.url + '/index.html');
    fullUrlFor('/').should.eql(ctx.config.url + '/');
    fullUrlFor('/index.html').should.eql(ctx.config.url + '/index.html');
  });

  it('internel url (pretty_urls.trailing_index disabled)', () => {
    ctx.config.pretty_urls = { trailing_index: false };
    fullUrlFor('index.html').should.eql(ctx.config.url + '/');
    fullUrlFor('/index.html').should.eql(ctx.config.url + '/');
  });


  it('external url', () => {
    [
      'https://hexo.io/',
      '//google.com/',
      // 'index.html' in external link should not be removed
      '//google.com/index.html'
    ].forEach(url => {
      fullUrlFor(url).should.eql(url);
    });
  });

  it('only hash', () => {
    fullUrlFor('#test').should.eql(ctx.config.url + '/#test');
  });
});

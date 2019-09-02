'use strict';

describe('full_url_for', () => {
  const ctx = {
    config: {}
  };

  const fullUrlFor = require('../../../lib/plugins/helper/full_url_for').bind(ctx);

  it('internal url', () => {
    ctx.config.root = '/';
    fullUrlFor('index.html').should.eql(ctx.config.url + '/index.html');
    fullUrlFor('/').should.eql(ctx.config.url + '/');
    fullUrlFor('/index.html').should.eql(ctx.config.url + '/index.html');

    ctx.config.root = '/blog/';
    fullUrlFor('index.html').should.eql(ctx.config.url + '/index.html');
    fullUrlFor('/').should.eql(ctx.config.url + '/');
    fullUrlFor('/index.html').should.eql(ctx.config.url + '/index.html');
  });

  it('external url', () => {
    [
      'https://hexo.io/',
      '//google.com/'
    ].forEach(url => {
      fullUrlFor(url).should.eql(url);
    });
  });

  it('only hash', () => {
    fullUrlFor('#test').should.eql('#test');
  });
});

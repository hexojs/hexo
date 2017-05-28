var should = require('chai').should(); // eslint-disable-line

describe('url_for', () => {
  var ctx = {
    config: {},
    relative_url: require('../../../lib/plugins/helper/relative_url')
  };

  var urlFor = require('../../../lib/plugins/helper/url_for').bind(ctx);

  it('internal url (relative off)', () => {
    ctx.config.root = '/';
    urlFor('index.html').should.eql('/index.html');
    urlFor('/').should.eql('/');
    urlFor('/index.html').should.eql('/index.html');

    ctx.config.root = '/blog/';
    urlFor('index.html').should.eql('/blog/index.html');
    urlFor('/').should.eql('/blog/');
    urlFor('/index.html').should.eql('/blog/index.html');
  });

  it('internal url (relative on)', () => {
    ctx.config.relative_link = true;
    ctx.config.root = '/';

    ctx.path = '';
    urlFor('index.html').should.eql('index.html');

    ctx.path = 'foo/bar/';
    urlFor('index.html').should.eql('../../index.html');

    ctx.config.relative_link = false;
  });

  it('internal url (options.relative)', () => {
    ctx.path = '';
    urlFor('index.html', {relative: true}).should.eql('index.html');

    ctx.config.relative_link = true;
    urlFor('index.html', {relative: false}).should.eql('/index.html');
    ctx.config.relative_link = false;
  });

  it('external url', () => {
    [
      'http://hexo.io/',
      '//google.com/'
    ].forEach(url => {
      urlFor(url).should.eql(url);
    });
  });

  it('only hash', () => {
    urlFor('#test').should.eql('#test');
  });
});

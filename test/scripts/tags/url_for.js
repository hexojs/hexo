'use strict';

const cheerio = require('cheerio');

describe('url_for', () => {
  const ctx = {
    config: { url: 'https://example.com' }
  };

  const urlForTag = require('../../../dist/plugins/tag/url_for')(ctx);
  const urlFor = args => urlForTag(args.split(' '));

  it('should encode path', () => {
    ctx.config.root = '/';
    let $ = cheerio.load(urlFor('foo fôo.html'));
    $('a').attr('href').should.eql('/f%C3%B4o.html');
    $('a').html().should.eql('foo');

    ctx.config.root = '/fôo/';
    $ = cheerio.load(urlFor('foo bár.html'));
    $('a').attr('href').should.eql('/f%C3%B4o/b%C3%A1r.html');
    $('a').html().should.eql('foo');
  });

  it('internal url (relative off)', () => {
    ctx.config.root = '/';
    let $ = cheerio.load(urlFor('index index.html'));
    $('a').attr('href').should.eql('/index.html');
    $('a').html().should.eql('index');

    $ = cheerio.load(urlFor('index /'));
    $('a').attr('href').should.eql('/');
    $('a').html().should.eql('index');

    $ = cheerio.load(urlFor('index /index.html'));
    $('a').attr('href').should.eql('/index.html');
    $('a').html().should.eql('index');

    ctx.config.root = '/blog/';
    $ = cheerio.load(urlFor('index index.html'));
    $('a').attr('href').should.eql('/blog/index.html');
    $('a').html().should.eql('index');

    $ = cheerio.load(urlFor('index /'));
    $('a').attr('href').should.eql('/blog/');
    $('a').html().should.eql('index');

    $ = cheerio.load(urlFor('index /index.html'));
    $('a').attr('href').should.eql('/blog/index.html');
    $('a').html().should.eql('index');
  });

  it('internal url (relative on)', () => {
    ctx.config.relative_link = true;
    ctx.config.root = '/';

    ctx.path = '';
    let $ = cheerio.load(urlFor('index index.html'));
    $('a').attr('href').should.eql('index.html');
    $('a').html().should.eql('index');

    ctx.path = 'foo/bar/';
    $ = cheerio.load(urlFor('index index.html'));
    $('a').attr('href').should.eql('../../index.html');
    $('a').html().should.eql('index');

    ctx.config.relative_link = false;
  });

  it('internal url (options.relative)', () => {
    ctx.path = '';
    let $ = cheerio.load(urlFor('index index.html true'));
    $('a').attr('href').should.eql('index.html');
    $('a').html().should.eql('index');

    ctx.config.relative_link = true;
    $ = cheerio.load(urlFor('index index.html false'));
    $('a').attr('href').should.eql('/index.html');
    $('a').html().should.eql('index');
    ctx.config.relative_link = false;
  });

  it('internel url (pretty_urls.trailing_index disabled)', () => {
    ctx.config.pretty_urls = { trailing_index: false };
    ctx.path = '';
    ctx.config.root = '/';
    let $ = cheerio.load(urlFor('index index.html'));
    $('a').attr('href').should.eql('/');
    $('a').html().should.eql('index');
    $ = cheerio.load(urlFor('index /index.html'));
    $('a').attr('href').should.eql('/');
    $('a').html().should.eql('index');

    ctx.config.root = '/blog/';
    $ = cheerio.load(urlFor('index index.html'));
    $('a').attr('href').should.eql('/blog/');
    $('a').html().should.eql('index');
    $ = cheerio.load(urlFor('index /index.html'));
    $('a').attr('href').should.eql('/blog/');
    $('a').html().should.eql('index');
  });

  it('external url', () => {
    [
      'https://hexo.io/',
      '//google.com/',
      // 'index.html' in external link should not be removed
      '//google.com/index.html'
    ].forEach(url => {
      const $ = cheerio.load(urlFor(`external ${url}`));
      $('a').attr('href').should.eql(url);
      $('a').html().should.eql('external');
    });
  });

  it('only hash', () => {
    const $ = cheerio.load(urlFor('hash #test'));
    $('a').attr('href').should.eql('#test');
    $('a').html().should.eql('hash');
  });
});

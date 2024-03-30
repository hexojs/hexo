import cheerio from 'cheerio';
import tagFullUrlFor from '../../../lib/plugins/tag/full_url_for';

describe('full_url_for', () => {
  const ctx: any = {
    config: { url: 'https://example.com' }
  };

  const fullUrlForTag = tagFullUrlFor(ctx);
  const fullUrlFor = args => fullUrlForTag(args.split(' '));

  it('no path input', () => {
    const $ = cheerio.load(fullUrlFor('nopath'));
    $('a').attr('href')!.should.eql(ctx.config.url + '/');
    $('a').html()!.should.eql('nopath');
  });

  it('internal url', () => {
    let $ = cheerio.load(fullUrlFor('index index.html'));
    $('a').attr('href')!.should.eql(ctx.config.url + '/index.html');
    $('a').html()!.should.eql('index');

    $ = cheerio.load(fullUrlFor('index /'));
    $('a').attr('href')!.should.eql(ctx.config.url + '/');
    $('a').html()!.should.eql('index');

    $ = cheerio.load(fullUrlFor('index /index.html'));
    $('a').attr('href')!.should.eql(ctx.config.url + '/index.html');
    $('a').html()!.should.eql('index');
  });

  it('internal url (pretty_urls.trailing_index disabled)', () => {
    ctx.config.pretty_urls = { trailing_index: false };
    let $ = cheerio.load(fullUrlFor('index index.html'));
    $('a').attr('href')!.should.eql(ctx.config.url + '/');
    $('a').html()!.should.eql('index');

    $ = cheerio.load(fullUrlFor('index /index.html'));
    $('a').attr('href')!.should.eql(ctx.config.url + '/');
    $('a').html()!.should.eql('index');
  });

  it('external url', () => {
    [
      'https://hexo.io/',
      '//google.com/',
      // 'index.html' in external link should not be removed
      '//google.com/index.html'
    ].forEach(url => {
      const $ = cheerio.load(fullUrlFor(`external ${url}`));
      $('a').attr('href')!.should.eql(url);
      $('a').html()!.should.eql('external');
    });
  });

  it('only hash', () => {
    const $ = cheerio.load(fullUrlFor('hash #test'));
    $('a').attr('href')!.should.eql(ctx.config.url + '/#test');
    $('a').html()!.should.eql('hash');
  });
});

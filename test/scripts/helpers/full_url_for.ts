import fullUrlForHelper from '../../../lib/plugins/helper/full_url_for';
type FullUrlForHelperParams = Parameters<typeof fullUrlForHelper>;
type FullUrlForHelperReturn = ReturnType<typeof fullUrlForHelper>;

describe('full_url_for', () => {
  const ctx: any = {
    config: { url: 'https://example.com' }
  };

  const fullUrlFor: (...args: FullUrlForHelperParams) => FullUrlForHelperReturn = fullUrlForHelper.bind(ctx);

  it('no path input', () => {
    fullUrlFor().should.eql(ctx.config.url + '/');
  });

  it('internal url', () => {
    fullUrlFor('index.html').should.eql(ctx.config.url + '/index.html');
    fullUrlFor('/').should.eql(ctx.config.url + '/');
    fullUrlFor('/index.html').should.eql(ctx.config.url + '/index.html');
  });

  it('internal url (pretty_urls.trailing_index disabled)', () => {
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

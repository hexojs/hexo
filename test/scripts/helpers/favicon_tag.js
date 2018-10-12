const should = require('chai').should(); // eslint-disable-line

describe('favicon_tag', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(__dirname);

  const ctx = {
    config: hexo.config
  };

  ctx.url_for = require('../../../lib/plugins/helper/url_for').bind(ctx);

  const favicon = require('../../../lib/plugins/helper/favicon_tag').bind(ctx);

  it('path', () => {
    favicon('favicon.ico').should.eql('<link rel="shortcut icon" href="/favicon.ico">');
  });
});

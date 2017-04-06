var should = require('chai').should(); // eslint-disable-line

describe('favicon_tag', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);

  var ctx = {
    config: hexo.config
  };

  ctx.url_for = require('../../../lib/plugins/helper/url_for').bind(ctx);

  var favicon = require('../../../lib/plugins/helper/favicon_tag').bind(ctx);

  it('path', () => {
    favicon('favicon.ico').should.eql('<link rel="shortcut icon" href="/favicon.ico">');
  });
});

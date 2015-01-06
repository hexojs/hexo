var should = require('chai').should();

describe('favicon_tag', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);
  var urlHelper = require('../../../lib/plugins/helper/url');

  var ctx = {
    config: hexo.config
  };

  ctx.url_for = urlHelper.url_for.bind(ctx);

  var favicon = require('../../../lib/plugins/helper/favicon_tag').bind(ctx);

  it('path', function(){
    favicon('favicon.ico').should.eql('<link rel="shortcut icon" href="/favicon.ico">');
  });
});
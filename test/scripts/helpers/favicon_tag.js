'use strict';

describe('favicon_tag', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo(__dirname);

  const ctx = {
    config: hexo.config
  };

  const favicon = require('../../../dist/plugins/helper/favicon_tag').bind(ctx);

  it('path', () => {
    favicon('favicon.ico').should.eql('<link rel="shortcut icon" href="/favicon.ico">');
  });
});

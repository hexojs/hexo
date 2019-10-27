'use strict';

describe('meta_generator', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo();

  const metaGeneratorHelper = require('../../../lib/plugins/helper/meta_generator').bind(hexo);

  it('default', () => {
    metaGeneratorHelper().should.eql(`<meta name="generator" content="Hexo ${hexo.version}">`);
  });
});

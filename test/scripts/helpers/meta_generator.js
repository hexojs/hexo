'use strict';

describe('meta_generator', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo();

  const metaGeneratorHelper = require('../../../lib/plugins/helper/meta_generator')(hexo);

  before(() => hexo.init());

  it('default', () => {
    const { version } = hexo;
    const versionType = typeof version;

    should.not.exist(hexo.extend.helper.getProp('meta_generator'));

    versionType.should.not.eql('undefined');
    metaGeneratorHelper().should.eql(`<meta name="generator" content="Hexo ${version}">`);

    hexo.extend.helper.getProp('meta_generator').should.eql(true);
  });
});

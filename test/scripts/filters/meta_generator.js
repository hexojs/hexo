'use strict';

describe('Meta Generator', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo();
  const metaGenerator = require('../../../lib/plugins/filter/meta_generator').bind(hexo);
  const cheerio = require('cheerio');

  it('default', () => {
    const content = '<head><title>foo</title></head>';
    const result = metaGenerator(content);

    const $ = cheerio.load(result);
    $('meta[name="generator"]').length.should.eql(1);
  });

  it('disable meta_generator', () => {
    const content = '<head><title>foo</title></head>';
    hexo.config.meta_generator = false;
    const result = metaGenerator(content);

    const resultType = typeof result;
    resultType.should.eql('undefined');
  });

  it('no duplicate generator tag', () => {
    const content = '<head><title>foo</title>'
      + '<meta name="generator" content="foo"></head>';
    hexo.config.meta_generator = true;
    const result = metaGenerator(content);

    const resultType = typeof result;
    resultType.should.eql('undefined');
  });
});

'use strict';

describe('Meta Generator', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo();
  const metaGenerator = require('../../../lib/plugins/filter/meta_generator').bind(hexo);
  const cheerio = require('cheerio');

  it('default', () => {
    const content = '<head><link></head>';
    const result = metaGenerator(content);

    const $ = cheerio.load(result);
    $('meta[name="generator"]').length.should.eql(1);
  });

  it('empty <head>', () => {
    const content = '<head></head>';
    const result = metaGenerator(content);

    // meta generator should not be prepended if <head> tag is empty
    // see https://github.com/hexojs/hexo/pull/3315
    const resultType = typeof result;
    resultType.should.eql('undefined');
  });
});

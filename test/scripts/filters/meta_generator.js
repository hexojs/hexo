'use strict';

describe('Meta Generator', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo();
  const metaGenerator = require('../../../lib/plugins/filter/after_render/meta_generator').bind(hexo);
  const cheerio = require('cheerio');

  it('default', () => {
    const content = '<head><link></head>';
    const result = metaGenerator(content);

    const $ = cheerio.load(result);
    $('meta[name="generator"]').length.should.eql(1);
    $('meta[name="generator"]').attr('content').should.eql(`Hexo ${hexo.version}`);
  });

  it('disable meta_generator', () => {
    const content = '<head><link></head>';
    hexo.config.meta_generator = false;
    const result = metaGenerator(content);

    const resultType = typeof result;
    resultType.should.eql('undefined');
  });

  it.skip('no duplicate generator tag', () => {
    hexo.config.meta_generator = true;
    const resultType = str => typeof metaGenerator(str);

    resultType('<head><link><meta name="generator" content="foo"></head>').should.eql('undefined');
    resultType('<head><link><meta content="foo" name="generator"></head>').should.eql('undefined');
  });

  it.skip('ignore empty head tag', () => {
    const content = '<head></head><head><link></head><head></head>';
    hexo.config.meta_generator = true;
    const result = metaGenerator(content);

    const $ = cheerio.load(result);
    $('meta[name="generator"]').length.should.eql(1);

    const expected = '<head></head><head><link><meta name="generator" content="Hexo '
      + hexo.version + '"></head><head></head>';
    result.should.eql(expected);
  });

  it.skip('apply to first non-empty head tag only', () => {
    const content = '<head></head><head><link></head><head><link></head>';
    hexo.config.meta_generator = true;
    const result = metaGenerator(content);

    const $ = cheerio.load(result);
    $('meta[name="generator"]').length.should.eql(1);

    const expected = '<head></head><head><link><meta name="generator" content="Hexo '
      + hexo.version + '"></head><head><link></head>';
    result.should.eql(expected);
  });

  // Test for Issue #3777
  it('multi-line head', () => {
    const content = '<head>\n<link>\n</head>';
    hexo.config.meta_generator = true;
    const result = metaGenerator(content);

    const $ = cheerio.load(result);
    $('meta[name="generator"]').length.should.eql(1);

    const expected = '<head>\n<link>\n<meta name="generator" content="Hexo ' + hexo.version + '"></head>';

    result.should.eql(expected);
  });
});

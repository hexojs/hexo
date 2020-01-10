'use strict';

const decache = require('decache');

describe('Meta Generator', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo();
  let metaGenerator;
  const metaGeneratorHelper = require('../../../lib/plugins/helper/meta_generator')(hexo);
  const cheerio = require('cheerio');

  beforeEach(async () => {
    await decache('../../../lib/plugins/filter/after_render/meta_generator');
    metaGenerator = require('../../../lib/plugins/filter/after_render/meta_generator').bind(hexo);
  });

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

  it('no duplicate generator tag', () => {
    hexo.config.meta_generator = true;
    const resultType = str => typeof metaGenerator(str);

    resultType('<head><link><meta name="generator" content="foo"></head>').should.eql('undefined');
    resultType('<head><link><meta content="foo" name="generator"></head>').should.eql('undefined');
  });

  it('ignore empty head tag', () => {
    const content = '<head></head><head><link></head><head></head>';
    hexo.config.meta_generator = true;
    const result = metaGenerator(content);

    const $ = cheerio.load(result);
    $('meta[name="generator"]').length.should.eql(1);

    const expected = '<head></head><head><link><meta name="generator" content="Hexo '
      + hexo.version + '"></head><head></head>';
    result.should.eql(expected);
  });

  it('apply to first non-empty head tag only', () => {
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

  it('no inject if meta_generator() helper is used', () => {
    const content = '<head><link></head>';
    hexo.config.meta_generator = true;
    metaGeneratorHelper();
    const result = metaGenerator(content);

    should.not.exist(result);
  });
});

'use strict';

const decache = require('decache');

describe('Meta Generator', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo();
  let metaGenerator;
  const cheerio = require('cheerio');

  beforeEach(() => {
    decache('../../../dist/plugins/filter/after_render/meta_generator');
    metaGenerator = require('../../../dist/plugins/filter/after_render/meta_generator').bind(hexo);
  });

  it('default', () => {
    const content = '<head><link></head>';
    const result = metaGenerator(content);

    const $ = cheerio.load(result);
    $('meta[name="generator"]').should.have.lengthOf(1);
    $('meta[name="generator"]').attr('content').should.eql(`Hexo ${hexo.version}`);
  });

  it('disable meta_generator', () => {
    const content = '<head><link></head>';
    hexo.config.meta_generator = false;
    const result = metaGenerator(content);

    should.not.exist(result);
  });

  it('no duplicate generator tag', () => {
    hexo.config.meta_generator = true;

    should.not.exist(metaGenerator('<head><link><meta name="generator" content="foo"></head>'));
    should.not.exist(metaGenerator('<head><link><meta content="foo" name="generator"></head>'));
  });

  // Test for Issue #3777
  it('multi-line head', () => {
    const content = '<head>\n<link>\n</head>';
    hexo.config.meta_generator = true;
    const result = metaGenerator(content);

    const $ = cheerio.load(result);
    $('meta[name="generator"]').should.have.lengthOf(1);

    const expected = '<head>\n<link>\n<meta name="generator" content="Hexo ' + hexo.version + '"></head>';

    result.should.eql(expected);
  });
});

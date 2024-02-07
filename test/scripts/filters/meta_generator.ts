import Hexo from '../../../lib/hexo';
import decache from 'decache';
import cheerio from 'cheerio';
import type hexoMetaGeneratorInject from '../../../lib/plugins/filter/after_render/meta_generator';
import chai from 'chai';
const should = chai.should();
type hexoMetaGeneratorInjectParams = Parameters<typeof hexoMetaGeneratorInject>;
type hexoMetaGeneratorInjectReturn = ReturnType<typeof hexoMetaGeneratorInject>;

describe('Meta Generator', () => {
  const hexo = new Hexo();
  let metaGenerator: (...args: hexoMetaGeneratorInjectParams) => hexoMetaGeneratorInjectReturn;

  beforeEach(() => {
    decache('../../../lib/plugins/filter/after_render/meta_generator');
    metaGenerator = require('../../../lib/plugins/filter/after_render/meta_generator').bind(hexo);
  });

  it('default', () => {
    const content = '<head><link></head>';
    const result = metaGenerator(content);

    const $ = cheerio.load(result);
    $('meta[name="generator"]').should.have.lengthOf(1);
    $('meta[name="generator"]').attr('content')!.should.eql(`Hexo ${hexo.version}`);
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

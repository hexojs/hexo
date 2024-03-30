import Hexo from '../../../lib/hexo';
import metaGeneratorHelper from '../../../lib/plugins/helper/meta_generator';
import chai from 'chai';
const should = chai.should();
type MetaGeneratorHelperParams = Parameters<typeof metaGeneratorHelper>;
type MetaGeneratorHelperReturn = ReturnType<typeof metaGeneratorHelper>;

describe('meta_generator', () => {
  const hexo = new Hexo();

  const metaGenerator: (...args: MetaGeneratorHelperParams) => MetaGeneratorHelperReturn = metaGeneratorHelper.bind(hexo);

  it('default', () => {
    const { version } = hexo;

    should.exist(version);
    metaGenerator().should.eql(`<meta name="generator" content="Hexo ${version}">`);
  });
});

import chai from 'chai';
import isClass from '../../util/isClass.js';
chai.should();

describe('Hexo ESM Import', function() {
  it('should import hexo as a class', async function() {
    const hexo = await import('../../../dist/esm/hexo/index.js');
    isClass(hexo.default ?? hexo).should.be.true;
  });
});

import chai from 'chai';
import isClass from '../../util/isClass.cjs';
chai.should();

describe('Hexo dual-mode import (ESM and CJS)', function() {
  this.timeout(60000); // 60 seconds
  it('imports hexo from CJS build as a class', async () => {
    const hexo = await import('../../../dist/cjs/hexo/index.js');
    isClass(hexo.default ?? hexo).should.be.true;
  });
  it('imports hexo from ESM build as a class', async () => {
    const hexo = await import('../../../dist/esm/hexo/index.js');
    isClass(hexo.default ?? hexo).should.be.true;
  });
});

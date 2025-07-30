const chai = require('chai');
const isClass = require('../../util/isClass');
chai.should();

describe('Hexo CommonJS Import', () => {
  it('should import hexo as a class', () => {
    const hexo = require('../../../');
    isClass(hexo).should.be.true;
  });
});

const chai = require('chai');
const isClass = require('../../util/isClass');
chai.should();

describe('Hexo CommonJS Import', function() {
  it('should import hexo as a class', function() {
    const hexo = require('../../../');
    isClass(hexo).should.be.true;
  });
});

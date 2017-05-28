var should = require('chai').should(); // eslint-disable-line
var sinon = require('sinon');

describe('Cache', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var Cache = hexo.model('Cache');

  it('_id - required', () => {
    var errorCallback = sinon.spy(err => {
      err.should.have.property('message', 'ID is not defined');
    });

    return Cache.insert({}).catch(errorCallback).finally(() => {
      errorCallback.calledOnce.should.be.true;
    });
  });
});

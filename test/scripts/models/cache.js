'use strict';

const sinon = require('sinon');

describe('Cache', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo();
  const Cache = hexo.model('Cache');

  it('_id - required', () => {
    const errorCallback = sinon.spy(err => {
      err.should.have.property('message', 'ID is not defined');
    });

    return Cache.insert({}).catch(errorCallback).finally(() => {
      errorCallback.calledOnce.should.be.true;
    });
  });
});

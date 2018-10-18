'use strict';

const sinon = require('sinon');
const pathFn = require('path');

describe('Asset', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo();
  const Asset = hexo.model('Asset');

  it('default values', () => Asset.insert({
    _id: 'foo',
    path: 'bar'
  }).then(data => {
    data.modified.should.be.true;
    return Asset.removeById(data._id);
  }));

  it('_id - required', () => {
    const errorCallback = sinon.spy(err => {
      err.should.have.property('message', 'ID is not defined');
    });

    return Asset.insert({}).catch(errorCallback).finally(() => {
      errorCallback.calledOnce.should.be.true;
    });
  });

  it('path - required', () => {
    const errorCallback = sinon.spy(err => {
      err.should.have.property('message', '`path` is required!');
    });

    return Asset.insert({
      _id: 'foo'
    }).catch(errorCallback).finally(() => {
      errorCallback.calledOnce.should.be.true;
    });
  });

  it('source - virtual', () => Asset.insert({
    _id: 'foo',
    path: 'bar'
  }).then(data => {
    data.source.should.eql(pathFn.join(hexo.base_dir, data._id));
    return Asset.removeById(data._id);
  }));
});

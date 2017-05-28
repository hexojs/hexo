var should = require('chai').should(); // eslint-disable-line
var sinon = require('sinon');
var pathFn = require('path');

describe('Asset', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var Asset = hexo.model('Asset');

  it('default values', () => Asset.insert({
    _id: 'foo',
    path: 'bar'
  }).then(data => {
    data.modified.should.be.true;
    return Asset.removeById(data._id);
  }));

  it('_id - required', () => {
    var errorCallback = sinon.spy(err => {
      err.should.have.property('message', 'ID is not defined');
    });

    return Asset.insert({}).catch(errorCallback).finally(() => {
      errorCallback.calledOnce.should.be.true;
    });
  });

  it('path - required', () => {
    var errorCallback = sinon.spy(err => {
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
